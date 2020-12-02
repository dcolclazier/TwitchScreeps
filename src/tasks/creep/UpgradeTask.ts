import { CreepTask } from "tasks/base/CreepTask";
import { CreepTaskType } from "core/types";
import { TaskFactory } from "core/TaskFactory";
import { Logger } from "utils/Logger";
import { CreepTaskRequest } from "tasks/model/CreepTaskRequest";

export class UpgradeTaskRequest extends CreepTaskRequest {

    type: CreepTaskType = CreepTaskType.UpgradeTask;
    usesTargetId: boolean = true;
    getTask(): ICreepTask {
        return new UpgradeTask(this);
    }

    constructor(constructionSiteId: Id<StructureController>, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, constructionSiteId);

    }
}

@TaskFactory.register
export class UpgradeTask extends CreepTask {

    image: string = "✨";
    type: CreepTaskType = CreepTaskType.UpgradeTask;

    protected prepare(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "PREPARING") return;

        global.util.room.fillup(creepName, RESOURCE_ENERGY, false);

        if(creep.store.getFreeCapacity() == 0){
            creep.memory.currentTaskStatus = "WORKING";
        }

        Logger.LogTrace(`In ${CreepTaskType[this.type]}: ${creepName} free capacity: ${creep.store.getFreeCapacity() }`);

    }

    protected work(creepName: string): void {


        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "WORKING") return;

        //slightly inefficient

        if(this.request.targetId === undefined) return;
        const controller = Game.getObjectById(this.request.targetId) as StructureController;

        const actionResult = creep.upgradeController(controller);
        if (actionResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(controller);
        }
        else if(actionResult === ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.currentTaskStatus = "PREPARING";
        }

    }

    protected cooldown(creepName: string): void {

    }

    public getSpawnInfo(roomName: string): SpawnInfo[] {
        return this._getSpawnInfo(roomName, this.type, () => true);
    }

    public addRequests(roomName: string) {

        const room = this.validateOwnedRoom(roomName);
        if(room?.controller === undefined) return;

        var upgradeTasks = global.taskManager.getTasks(roomName, CreepTaskType.UpgradeTask) as CreepTaskRequest[];

        if(!_.any(upgradeTasks)){
            Logger.LogTrace(`Adding ${this.type} task to room ${roomName}`);
            global.taskManager.addTaskRequest(new UpgradeTaskRequest(room.controller.id, roomName, roomName))
        }
    }
    canAssign(workerId: string): boolean {
        return true;
    }
}
