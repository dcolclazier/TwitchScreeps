import { CreepTask } from "tasks/base/CreepTask";
import { CreepTaskRequest } from "tasks/base/CreepTaskRequest";
import TaskType, { CreepTaskType, TaskCategory } from "contract/types";
import { ITaskCatalog } from "contract/ITaskCatalog";
// import { BuildTask, BuildTaskRequest } from "tasks/creep/BuildTask";
// import { MineTask, MineTaskRequest } from "tasks/creep/MineTask";
// import { RestockTask, RestockTaskRequest } from "tasks/creep/RestockTask";
// import { UpgradeTask, UpgradeTaskRequest } from "tasks/creep/UpgradeTask";

export class TaskManager{

    public addTaskRequest(request : ITaskRequest){
        Memory.tasks[request.originatingRoom][request.id] = request;
    }

    public getTasks(roomName: string, type: TaskType) : ITaskRequest[]{

        const roomTasks = Memory.tasks[roomName];
        let toReturn = <ITaskRequest[]>[];
        if(roomTasks === undefined || roomTasks === null || roomTasks === {}) return [];

        for(let taskId in roomTasks){
            const task = roomTasks[taskId] as ITaskRequest;
            if(task.type === type) toReturn.push(task);
        }
        return toReturn;
    }

    public runTasks(roomName:string): void{

        const tasks = Memory.tasks[roomName];
        const room = Game.rooms[roomName];
        if(room === undefined || room === null) return;
        this.addTaskRequests(roomName);

        for(let requestId in tasks){
            let request = tasks[requestId];
            if(request.isFinished)
            {
                delete tasks[requestId];
            }
            else{
                this.cleanTaskRequest(roomName, requestId);

                if(request.category == TaskCategory.Creep) {

                    this.processCreepTaskRequest(roomName, requestId);
                }
                else if(request.category == TaskCategory.Structure) throw new Error("Not implemented");

            }
        }

        Memory.tasks[roomName] = tasks;
    }

    private getUnassignedCreep(roomName: string, taskType: TaskType) : string | undefined{


        for(let creepName in Game.creeps){
            const creep = Game.creeps[creepName];

            if(creep === null || creep === undefined) continue;
            if(creep.memory === undefined) continue;
            if(creep.room.name != roomName) continue;

            if(!_.contains(creep.memory.acceptedTaskTypes, taskType)){
                continue;
            }
            if(creep.memory.currentTaskId !== "") continue;
            return creepName;
        }
        return undefined;
    }

    private processCreepTaskRequest(roomName: string, requestId: string) {

        const request = Memory.tasks[roomName][requestId] as CreepTaskRequest;

        if(request.creepsAssigned.length !== 0)
        {
            const task = this.getTask(request);
            if(task === null || task === undefined){
                console.log(`ERROR: task for ${request.type} was not found...`);
                return;
            }
            task.run();
        }
        if(request.isFinished) return;

        const spawnLevel = CreepTask.getSpawnLevel(roomName);
        const taskType =  request.type as CreepTaskType;
        const creepsPerTask = global.taskCatalog[taskType].creepsPerTask;
        // if(request.type == CreepTaskType.RestockTask){

        //     console.log(spawnLevel);
        //     console.log(taskType);
        //     console.log(creepsPerTask);

        // }
        if (request.creepsAssigned.length < creepsPerTask) {

            let assignmentsNeeded = creepsPerTask- request.creepsAssigned.length;
            for(let x = 0; x < assignmentsNeeded; x++){

                let creepName = this.getUnassignedCreep(request.targetRoom, request.type);
                if(creepName === undefined) break;
                const creep = Game.creeps[creepName];
                creep.memory.currentTaskId = request.id;
                request.creepsAssigned.push(creepName);
                console.log(`Assigned ${request.type}${request.id} to ${creepName}`);
            }

        }
    }

    private cleanTaskRequest(roomName: string, requestId: string){

        const iTask = Memory.tasks[roomName][requestId];
        if(iTask.category === TaskCategory.Creep){
            const request = iTask as CreepTaskRequest;
            for(let name of request.creepsAssigned){
                const creep = Game.creeps[name];
                if(creep === null || creep === undefined){
                    console.log(`Unassigning ${name} from ${request.category}${request.id} (Dead)`)
                    request.creepsAssigned = _.filter(request.creepsAssigned, c => c != name);
                }
            }
        }

        //todo handle case for STRUCTURE
    }

    private getTask(request : ITaskRequest) : ITask | undefined{

        //how cpu intensive is this???
        const tasks = _.filter(ITaskCatalog.GetImplementations(), t => {
            let test = new t(request) as ITask;
            return test.type === request.type;
        });
        // console.log(JSON.stringify(tasks));
        if(tasks.length === 0) return undefined;
        return new tasks[0](request);

        // switch(request.type){
        //     case CreepTaskType.BuildTask: return new BuildTask(request as BuildTaskRequest);
        //     case CreepTaskType.MineTask: return new MineTask(request as MineTaskRequest);
        //     case CreepTaskType.UpgradeTask: return new UpgradeTask(request as UpgradeTaskRequest);
        //     case CreepTaskType.RestockTask: return new RestockTask(request as RestockTaskRequest);
        // }
        // return undefined
    }

    private addTaskRequests(roomName: string){

        const tasks = ITaskCatalog.GetImplementations();
        for(let id in tasks){
            var task = new tasks[id]() as CreepTask;
            task.addRequests(roomName);
        }
    }
    //#endregion


}
