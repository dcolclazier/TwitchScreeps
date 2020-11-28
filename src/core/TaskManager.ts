import { CreepTask } from "tasks/base/CreepTask";
import { CreepTaskRequest } from "tasks/base/CreepTaskRequest";
import TaskType, { TaskCategory } from "contract/types";
import { ITaskCatalog } from "contract/ITaskCatalog";
import { Governor } from "./Governor";
import { Logger } from "utils/Logger";

export class TaskManager{

    public addTaskRequest(request : ITaskRequest){

        Logger.LogInformation(`Registering ${request.targetRoom}::${request.category}:${request.type}:${request.id} request`)
        Memory.tasks[request.originatingRoom][request.id] = request;
    }

    public getTasks(roomName: string, type: TaskType) : ITaskRequest[]{

        const roomTasks = Memory.tasks[roomName];
        const toReturn = <ITaskRequest[]>[];
        if(roomTasks === undefined || roomTasks === null || roomTasks === {}) {
            Logger.LogTrace(`No tasks found for room ${roomName}`);
            return [];
        }

        for(let taskId in roomTasks){
            const task = roomTasks[taskId];
            if(task.type === type) toReturn.push(task);
        }
        return toReturn;
    }

    public runTasks(roomName:string): void{

        const tasks = Memory.tasks[roomName];
        const room = Game.rooms[roomName];
        if(room === undefined || room === null) {
            Logger.LogWarning(`Can't run tasks for room ${roomName} - room is undefined in Game.rooms`)
            return;
        }
        this.addTaskRequests(roomName);

        for(let requestId in tasks){

            const request = tasks[requestId];
            if(request.isFinished)
            {
                Logger.LogTrace(`Unregistering complete task ${request.type}${request.id}`);
                delete tasks[requestId];
            }
            else{
                switch(request.category){
                    case TaskCategory.Creep:
                        this.processCreepTaskRequest(roomName, requestId);
                        break;
                    case TaskCategory.Structure:
                        throw new Error("runTasks::processStructureTaskRequest is not implemented");
                }
            }
        }

        Memory.tasks[roomName] = tasks;
    }

    private processCreepTaskRequest(roomName: string, requestId: string) : void {

        const request = this.unassignDeadCreeps(roomName, requestId);
        if(request.creepsAssigned.length !== 0)
        {
            const task = this.getTask(request);
            if(task === undefined){
                Logger.LogWarning(`The task for ${request.type} was not found... did you register it properly in the catalog?`);
                return;
            }
            Logger.LogTrace(`Running ${request.type} task (${request.id}) in ${roomName}`);
            task.run();
        }
        if(request.isFinished) return;
        this.assignMissingCreeps(roomName, requestId);
    }

    private getUnassignedCreep(roomName: string, taskType: TaskType) : string | undefined{

        for(let creepName in Game.creeps){
            const creep = Game.creeps[creepName];

            if(creep === null) {
                Logger.LogTrace("In getUnassignedCreep, creep was null.")
                continue;
            }
            if(creep.memory === undefined) {
                Logger.LogTrace("In getUnassignedCreep, creep had no memory.")
                continue;
            }
            if(!_.contains(creep.memory.acceptedTaskTypes, taskType)){
                Logger.LogTrace(`In getUnassignedCreep, ${creepName} does not contain ${taskType}... ${JSON.stringify(creep.memory.acceptedTaskTypes)}`);
                continue;
            }
            if(creep.room.name != roomName) {
                Logger.LogTrace(`In getUnassignedCreep, ${creepName} is not in ${roomName}`)
                continue;
            }

            if(creep.memory.currentTaskId !== "") continue;
            return creepName;
        }
        return undefined;
    }

    private assignMissingCreeps(roomName: string, requestId: string) {

        const request = Memory.tasks[roomName][requestId] as CreepTaskRequest;
        const spawnLevel = Governor.getSpawnLevel(roomName);
        const acceptedJobTypes = global.taskCatalog[request.type][spawnLevel].acceptedJobTypes;

        for(let id in acceptedJobTypes){
            const jobType = acceptedJobTypes[id];
            const creepsPerTask = global.taskCatalog[request.type][spawnLevel].creepsPerTask[jobType];
            if (request.creepsAssigned.length < creepsPerTask) {

                let assignmentsNeeded = creepsPerTask - request.creepsAssigned.length;
                for(let x = 0; x < assignmentsNeeded; x++){
                    //if we can't assign, no need to continue;
                    if(!this.assignRequestToCreep(roomName, requestId)) break;
                }

            }
        }

    }

    private assignRequestToCreep(roomName: string, requestId: string) : boolean {

        const request = Memory.tasks[roomName][requestId] as CreepTaskRequest
        let creepName = this.getUnassignedCreep(request.targetRoom, request.type);
        if(creepName === undefined) {
            Logger.LogTrace("In assignRequestToCreep, couldn't assign - idle creep not found.");
            return false;
        }

        const creep = Game.creeps[creepName];
        if(creep === null) {
            Logger.LogTrace("In assignRequestToCreep, couln't assign - creep was null")
            return false;
        }

        creep.memory.currentTaskId = request.id;
        request.creepsAssigned.push(creepName);
        Logger.LogInformation(`Assigned ${request.type}${request.id} to ${creepName}`)
        return true;

    }

    private unassignDeadCreeps(roomName: string, requestId: string) : CreepTaskRequest{
        const request = Memory.tasks[roomName][requestId] as CreepTaskRequest;
        for(let name of request.creepsAssigned){
            const creep = Game.creeps[name];
            if(creep === null || creep === undefined)
            {
                Logger.LogInformation(`Unassigning ${name} from ${request.category}${request.id} (Dead)`)
                request.creepsAssigned = _.filter(request.creepsAssigned, c => c != name);
            }
        }
        return request;
    }

    private getTask(request : ITaskRequest) : ITask | undefined{

        //how cpu intensive is this???
        const tasks = _.filter(ITaskCatalog.GetImplementations(), t => {
            let test = new t(request) as ITask;
            return test.type === request.type;
        });
        if(tasks.length === 0) return undefined;
        return new tasks[0](request);
    }

    private addTaskRequests(roomName: string){

        const tasks = ITaskCatalog.GetImplementations();
        for(let id in tasks){
            var task = new tasks[id]() as CreepTask;
            task.addRequests(roomName);
        }
    }

}
