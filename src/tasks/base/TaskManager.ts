import TaskType, { TaskCategory } from "core/types";
import { Governor } from "../../core/Governor";
import { Logger } from "utils/Logger";
import { StructureTaskRequest } from "tasks/model/StructureTaskRequest";
import { CreepTaskRequest } from "tasks/model/CreepTaskRequest";
import { TaskFactory } from "core/TaskFactory";

export class TaskManager{

    public addTaskRequest(request : ITaskRequest){

        Logger.LogInformation(`Registering ${request.targetRoom}::${request.category}:${request.type}:${request.id} request`)
        if(!Memory.tasksN[request.targetRoom][request.type]){
            Memory.tasksN[request.targetRoom][request.type] = {};
        }
        Memory.tasksN[request.targetRoom][request.type][request.id] = request;
    }

    public getTasks(roomName: string, type: TaskType) : ITaskRequest[]{

        return _.map(Memory.tasksN[roomName][type], m => m);
    }

    public runTasks(roomName:string): void{

        const tasksN = Memory.tasksN[roomName];

        const room = Game.rooms[roomName];
        if(room === undefined || room === null) {
            Logger.LogWarning(`Can't run tasks for room ${roomName} - room is undefined in Game.rooms`)
            return;
        }
        this.addTaskRequests(roomName);

        for(const taskType in tasksN)
        {
            Logger.LogTrace(`Processing ${taskType} tasks...`);
            for(const id in tasksN[taskType])
            {
                Logger.LogTrace(`  Processing task ${id}`);
                const request = tasksN[taskType][id];
                if(request.isFinished)
                {
                    Logger.LogTrace(`    Unregistering complete task ${request.type}${request.id}`);
                    delete tasksN[taskType][id];
                }
                else{
                    switch(request.category){
                        case TaskCategory.Creep:
                            this.processCreepTaskRequest(roomName, taskType as TaskType, id);
                            break;
                        case TaskCategory.Structure:
                            this.processStructureTaskRequest(roomName, taskType as TaskType, id);
                    }
                }
            }
        }
        Memory.tasksN[roomName] = tasksN;
    }
    private processStructureTaskRequest(roomName: string, taskType: TaskType, requestId: string) {

        Logger.LogTrace(`Processing structure task request for ${roomName}: ${requestId}`);
        const request = this.unassignDeadStructures(roomName, taskType, requestId) as StructureTaskRequest;
        if(request.structuresAssigned.length != 0){
            const task = TaskFactory.getTask(request);
            if(task === undefined){
                Logger.LogWarning(`The task for ${request.type} was not found... did you register it properly in the catalog?`);
                return;
            }
            Logger.LogTrace(`Running ${request.type} task (${request.id}) in ${roomName}`);
            task.run();
        }
        if(request.isFinished) return;
        this.assignMissingStructures(roomName, taskType, requestId);

    }



    private processCreepTaskRequest(roomName: string, taskType: TaskType, requestId: string) : void {

        const request = this.unassignDeadCreeps(roomName, taskType, requestId);
        if(request.creepsAssigned.length !== 0)
        {
            const task = TaskFactory.getTask(request);
            if(task === undefined){
                Logger.LogWarning(`The task for ${request.type} was not found... did you register it properly in the catalog?`);
                return;
            }
            Logger.LogTrace(`Running ${request.type} task (${request.id}) in ${roomName}`);
            task.run();
        }
        if(request.isFinished) return;
        this.assignMissingCreeps(roomName, taskType, requestId);
    }

    private getUnassignedStructure<T extends OwnedStructure<StructureConstant>>(roomName: string, taskType: TaskType, requestId: string, structureType: StructureConstant) : Id<T> | undefined {

        return _.find(Memory.structures[roomName][structureType], s => s.currentTaskId === "" && _.contains(s.acceptedTaskTypes, taskType))?.id as Id<T>;
    }

    private getUnassignedCreep(roomName: string, taskType: TaskType) : string | undefined{

        return _.find(Game.creeps, c => c.room.name === roomName &&
                                        c.memory.currentTaskId === "" &&
                                        _.contains(c.memory.acceptedTaskTypes, taskType))?.name;
    }
    private assignMissingStructures(roomName: string, taskType: TaskType, requestId: string) {

        const request = Memory.tasksN[roomName][taskType][requestId] as StructureTaskRequest;
        const spawnLevel = Governor.getSpawnLevel(roomName);

        const structureType = request.structureType;
        const maxStructures = global.structureTaskCatalog[request.type][spawnLevel].maxStructuresPerTask;

        if (request.structuresAssigned.length < maxStructures) {

            let assignmentsNeeded = maxStructures - request.structuresAssigned.length;
            for(let x = 0; x < assignmentsNeeded; x++){
                //if we can't assign, no need to continue;
                if(!this.assignRequestToStructure(roomName, requestId, taskType, structureType)) break;
            }
        }
    }


    private assignMissingCreeps(roomName: string, taskType: TaskType, requestId: string) {

        const request = Memory.tasksN[roomName][taskType][requestId] as CreepTaskRequest;
        const spawnLevel = Governor.getSpawnLevel(roomName);
        const acceptedJobTypes = global.creepTaskCatalog[request.type][spawnLevel].acceptedJobTypes;

        for(let id in acceptedJobTypes){
            const jobType = acceptedJobTypes[id];
            const creepsPerTask = global.creepTaskCatalog[request.type][spawnLevel].creepsPerTask[jobType];
            if (request.creepsAssigned.length < creepsPerTask) {

                let assignmentsNeeded = creepsPerTask - request.creepsAssigned.length;
                for(let x = 0; x < assignmentsNeeded; x++){
                    //if we can't assign, no need to continue;
                    if(!this.assignRequestToCreep(roomName, taskType, requestId)) break;
                }

            }
        }

    }

    assignRequestToStructure(roomName: string, requestId: string, taskType: TaskType, structureType: StructureConstant) : boolean{

        // const request = Memory.tasks[roomName][requestId] as StructureTaskRequest;
        const request = Memory.tasksN[roomName][taskType][requestId] as StructureTaskRequest;
        let structureId = this.getUnassignedStructure(roomName, taskType, request.id, structureType);
        if(structureId === undefined) {
            Logger.LogTrace("In assignRequestToStructure, couldn't assign - idle structure not found.");
            return false;
        }

        const structure = Game.getObjectById(structureId) as OwnedStructure<StructureConstant>;
        if(structure === null || structure === undefined) {
            Logger.LogWarning("In assignRequestToStructure couln't assign - structure was null")
            return false;
        }

        if(structure.structureType !== structureType){
            Logger.LogError("In assignRequestToStructure couln't assign - structure did not match! BUG!")
            return false;
        }

        const task = TaskFactory.getTask(request);
        if(!task.canAssign(structureId)) return false;


        request.structuresAssigned.push(structureId);
        Logger.LogInformation(`Assigned ${request.type}${request.id} to ${structureType}${structure.id}`);
        return true;

    }


    private assignRequestToCreep(roomName: string, taskType: TaskType, requestId: string) : boolean {

        // const request = Memory.tasks[roomName][requestId] as CreepTaskRequest

        const request = Memory.tasksN[roomName][taskType][requestId] as CreepTaskRequest;
        if(request.targetRoom === undefined) return false;
        let creepName = this.getUnassignedCreep(request.targetRoom, request.type);
        if(creepName === undefined) {
            Logger.LogTrace("In assignRequestToCreep, couldn't assign - idle creep not found.");
            return false;
        }

        const creep = Game.creeps[creepName];
        if(creep === null || !creep.memory) {
            Logger.LogTrace(`In assignRequestToCreep, couln't assign - creep was null - ${creep?.name}`)
            return false;
        }

        creep.memory.currentTaskId = request.id;
        request.creepsAssigned.push(creepName);
        Logger.LogInformation(`Assigned ${request.type}${request.id} to ${creepName}`)
        return true;

    }
    private unassignDeadStructures(roomName: string, taskType: TaskType, requestId: string): StructureTaskRequest {
        const request = Memory.tasksN[roomName][taskType][requestId] as StructureTaskRequest;
        for(let id of request.structuresAssigned){
            const structure = Game.getObjectById(id);
            if(structure === null || structure === undefined)
            {
                Logger.LogInformation(`Unassigning ${id} from ${request.category}${request.id} (Dead)`)
                _.remove(request.structuresAssigned, id);
            }
        }
        return request;
    }
    private unassignDeadCreeps(roomName: string, taskType: TaskType, requestId: string) : CreepTaskRequest{
        const request = Memory.tasksN[roomName][taskType][requestId] as CreepTaskRequest;
        for(let creepId of request.creepsAssigned){
            const creep = Game.creeps[creepId];
            if(creep === null || creep === undefined)
            {
                Logger.LogInformation(`Unassigning ${creepId} from ${request.category}${request.id} (Dead)`);
                _.remove(request.creepsAssigned, creepId);
            }
        }
        return request;
    }

    private addTaskRequests(roomName: string){

        for(let task of TaskFactory.getHandlers()){
            Logger.LogTrace(`Adding ${task.type} task to room ${roomName}`);
            task.addRequests(roomName);

        }
    }

}
