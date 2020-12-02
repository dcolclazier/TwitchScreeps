import { CreepTask } from "tasks/base/CreepTask";
import { CreepTaskRequest } from "tasks/model/CreepTaskRequest";
import { CreepTaskType } from "core/types";
import { TaskFactory as TaskFactory } from "core/TaskFactory";
import { Logger } from "utils/Logger";

export class RestockTaskRequest extends CreepTaskRequest {

    type: CreepTaskType = CreepTaskType.RestockTask;
    usesTargetId: boolean = false;

    constructor(resourceLocationId: any, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, resourceLocationId);

    }
}

@TaskFactory.register
export class RestockTask extends CreepTask {

    type: CreepTaskType = CreepTaskType.RestockTask;
    image: string = "🛒";
    currentRestockId: string | undefined = undefined;

    protected prepare(creepName: string): void {
        const creep = Game.creeps[creepName];

        if (creep.memory.currentTaskStatus !== "PREPARING")
            return;

        const restockTargets = global.util.room.getRestockables(creep.room.name);
        if (restockTargets.length === 0) {
            creep.memory.currentTaskStatus = "DONE";
            return;
        }

        global.util.room.fillup(creepName, RESOURCE_ENERGY, false);

        if(creep.store.getFreeCapacity() === 0){
            creep.memory.currentTaskStatus = "WORKING";
        }

        Logger.LogTrace(`In ${CreepTaskType[this.type]}: ${creepName} free capacity: ${creep.store.getFreeCapacity() }`);

    }

    protected work(creepName: string): void {

        const creep = Game.creeps[creepName];

        if (creep.memory.currentTaskStatus != "WORKING")
            return;

        if (this.currentRestockId === undefined) {
            this.currentRestockId = this.getNextRestockId(creepName);
            if (this.currentRestockId === undefined) {
                creep.memory.currentTaskStatus = "DONE";
                return;
            }
            // Logger.LogDebug("Restock ID: " + this.currentRestockId);
        }
        if(creep.store.getUsedCapacity() == 0){
            creep.memory.currentTaskStatus = "PREPARING";
        }

        const target = <StructureExtension | StructureSpawn>Game.getObjectById(this.currentRestockId);

        var result = creep.transfer(target, _.findKey(creep.store) as ResourceConstant)
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }

    protected cooldown(creepName: string): void {
    }

    public getSpawnInfo(roomName: string): SpawnInfo[]{
        return this._getSpawnInfo(roomName, this.type, () => true);
    }

    public addRequests(roomName: string): void {

        const room = this.validateOwnedRoom(roomName);
        if(room?.controller === undefined) return;

        if(global.util.room.getRestockables(roomName).length === 0) {
            Logger.LogTrace(`No restockables found in ${roomName}. No requests will be added`);
            return;
        }

        var restockTasks = global.taskManager.getTasks(roomName, CreepTaskType.RestockTask) as CreepTaskRequest[];
        if(!_.any(restockTasks)){
            Logger.LogTrace(`Adding restock task to room ${roomName}`);
            global.taskManager.addTaskRequest(new RestockTaskRequest(room.controller.id, roomName, roomName))
        }
    }

    private getNextRestockId(creepName: string): string | undefined {

        const creep = Game.creeps[creepName];
        const restockables = global.util.room.getRestockables(creep.room.name)
            .sort((structureA, structureB) => creep.pos.getRangeTo(structureA) - creep.pos.getRangeTo(structureB));

        if (restockables.length === 0)
            return undefined;
        else {
            const id = restockables[0].id;
            return id === undefined ? undefined : id;
        }
    }

    canAssign(workerId: string): boolean {
        return true;
    }
}
