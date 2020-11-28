import { CreepTask } from ".././base/CreepTask";
import { CreepTaskRequest } from ".././base/CreepTaskRequest";
import TaskType, { CreepTaskType, JobType } from "../../contract/types";
import { ITaskCatalog } from "contract/ITaskCatalog";

export class UpgradeTaskRequest extends CreepTaskRequest {
    jobType: JobType = JobType.Upgrader;
    type: TaskType = CreepTaskType.UpgradeTask;
    usesTargetId: boolean = true;
    getTask(): ICreepTask {
        return new UpgradeTask(this);
    }

    constructor(constructionSiteId: Id<StructureController>, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, constructionSiteId);

    }
}

@ITaskCatalog.register
export class UpgradeTask extends CreepTask {

    image: string = "✨";
    type: TaskType = CreepTaskType.UpgradeTask;

    protected prepare(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "PREPARING")
            return;

        //creep.memory.currentTaskStatus = "WORKING";
        global.util.room.fillup(creep.name, RESOURCE_ENERGY);


        if (creep.store.getFreeCapacity() == 0)
        {
            creep.memory.currentTaskStatus = "WORKING";
            return;
        }

    }

    protected work(creepName: string): void {

        if (creepName === "") return;

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "WORKING") return;

        //slightly inefficient
        const controller = Game.getObjectById(this.request.targetId) as StructureController;

        const actionResult = creep.upgradeController(controller);
        if (actionResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(controller);
        }
        else if(actionResult === ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.currentTaskStatus = "PREPARING";
        }

    }
    protected cooldown(creepName: string): void { }

    public getSpawnInfo(roomName: string): SpawnInfo {
        return this._getSpawnInfo(roomName, JobType.Upgrader, this.type as CreepTaskType, () => true)
    }

    public addRequests(roomName: string) {

        const room = Game.rooms[roomName];
        if(room?.controller === (null || undefined)) return;
        var upgradeTasks = global.taskManager.getTasks(roomName, CreepTaskType.UpgradeTask) as CreepTaskRequest[];

        if(!_.any(upgradeTasks)){
            global.taskManager.addTaskRequest(new UpgradeTaskRequest(room.controller.id, roomName, roomName))
        }
    }
}
