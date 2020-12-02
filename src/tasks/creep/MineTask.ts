import { CreepTask } from "tasks/base/CreepTask";
import { CreepTaskType } from "core/types";
import { TaskFactory } from "core/TaskFactory";
import { Logger } from "utils/Logger";
import { CreepTaskRequest } from "tasks/model/CreepTaskRequest";

export class MineTaskRequest extends CreepTaskRequest {

    usesTargetId: boolean = true;
    type: CreepTaskType = CreepTaskType.MineTask;

    constructor(sourceId: Id<Source>, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, sourceId);
    }
}

@TaskFactory.register
export class MineTask extends CreepTask {

    image: string = "⛏";
    type: CreepTaskType = CreepTaskType.MineTask;

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

        if(this.request.targetId === undefined) return;
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

        const sources = room.memory.sources;
        for(let id in sources){
            const memory = sources[id];
            if(!_.any(mineTasks, t => t.targetId == memory.id)){
                Logger.LogTrace(`Adding ${this.type} task to room ${roomName}`);
                global.taskManager.addTaskRequest(new MineTaskRequest(memory.id, roomName, roomName))
            }
        }
    }
    canAssign(workerId: string): boolean {
        return true;
    }
}
