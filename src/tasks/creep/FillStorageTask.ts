import { CreepTask } from "../base/CreepTask";
import { CreepTaskType } from "../../core/types";
import { TaskFactory } from "core/TaskFactory";
import { Logger } from "utils/Logger";
import { CreepTaskRequest } from "../model/CreepTaskRequest";

export class FillStorageRequest extends CreepTaskRequest{
    usesTargetId: boolean = true;
    type: CreepTaskType = CreepTaskType.FillStorageTask;

    constructor(storageId: Id<StructureStorage>, originatingRoom: string, targetRoom: string){
        super(originatingRoom, targetRoom, storageId);
    }
}

@TaskFactory.register
export class FillStorageTask extends CreepTask {

    image: string = "🚧";
    type: CreepTaskType = CreepTaskType.FillStorageTask;
    canAssign(workerId: string): boolean {
        return true;
    }
    protected prepare(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus !== "PREPARING")
            return;

        if(Game.rooms[creep.room.name].storage!.store.getCapacity(RESOURCE_ENERGY) == 0){
            creep.memory.currentTaskStatus = "DONE";
        }

        global.util.room.fillup(creepName, RESOURCE_ENERGY, true);

        if(creep.store.getFreeCapacity() == 0){
            creep.memory.currentTaskStatus = "WORKING";
        }

        Logger.LogTrace(`In ${CreepTaskType[this.type]}: ${creepName} free capacity: ${creep.store.getFreeCapacity() }`);
    }

    protected work(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "WORKING")
            return;

        if(this.request.targetId === undefined) return;
        const storage = Game.getObjectById(this.request.targetId) as StructureTower;


        if(Game.rooms[creep.room.name].storage!.store.getCapacity(RESOURCE_ENERGY) == 0){
            creep.memory.currentTaskStatus = "DONE";
        }


        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.currentTaskStatus = "DONE";
            return;
        }

        var result = creep.transfer(storage, RESOURCE_ENERGY)
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage);
        }
        else if (result === ERR_FULL){

            creep.memory.currentTaskStatus = "DONE";
        }

    }

    protected cooldown(creepName: string): void {
        //Not used for this task
    }

    public getSpawnInfo(roomName: string): SpawnInfo[] {

        return this._getSpawnInfo(roomName, this.type, () => true);
    }

    public addRequests(roomName: string): void {
        const room = Game.rooms[roomName];
        if (room === null || room === undefined) return;

        var storage = room.storage;
        if (storage === undefined || storage.store.getFreeCapacity(RESOURCE_ENERGY) <= 200) return;

        Logger.LogTrace(`Storage capacity: ${storage.store.getFreeCapacity(RESOURCE_ENERGY).toString()}`);
        const storageTasks = global.taskManager.getTasks(roomName, CreepTaskType.FillStorageTask) as FillStorageRequest[];

        if (_.find(storageTasks, b => b.targetId === storage!.id) === undefined) {
            Logger.LogTrace(`Adding ${this.type} task to room ${roomName}`);
            global.taskManager.addTaskRequest(new FillStorageRequest(storage.id, roomName, roomName));
        }
    }
}
