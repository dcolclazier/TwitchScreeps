import { CreepTask } from ".././base/CreepTask";
import { CreepTaskRequest } from ".././base/CreepTaskRequest";
import TaskType, { CreepTaskType } from "../../contract/types";
import { ITaskCatalog } from "contract/ITaskCatalog";
import { Logger } from "utils/Logger";

export class MineTaskRequest extends CreepTaskRequest {

    usesTargetId: boolean = true;
    type: TaskType = CreepTaskType.MineTask;

    constructor(sourceId: Id<Source>, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, sourceId);
    }
}

@ITaskCatalog.register
export class MineTask extends CreepTask {

    image: string = "⛏";
    type: TaskType = CreepTaskType.MineTask;

    protected prepare(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus !== "PREPARING")
            return;

        creep.memory.currentTaskStatus = "WORKING";
    }

    protected work(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "WORKING")
            return;

        const source = Game.getObjectById(this.request.targetId) as Source;
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    }

    protected cooldown(creepName: string): void {

    }

    public getSpawnInfo(roomName: string) {

        return this._getSpawnInfo(roomName, this.type, () => true);
    }

    public addRequests(roomName: string): void {

        const room = this.validateOwnedRoom(roomName);
        if(room?.controller === undefined) return;

        var mineTasks = global.taskManager.getTasks(roomName, CreepTaskType.MineTask) as CreepTaskRequest[];
        var sources = room.find(FIND_SOURCES);
        for(let sourceId in sources){
            const source = sources[sourceId];
            if(!_.any(mineTasks, t => t.targetId == source.id)){
                Logger.LogTrace(`Adding ${this.type} task to room ${roomName}`);
                global.taskManager.addTaskRequest(new MineTaskRequest(source.id, roomName, roomName))
            }
        }
    }
}
