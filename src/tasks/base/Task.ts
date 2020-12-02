import TaskType, { TaskCategory } from "core/types";
import { Logger } from "utils/Logger";

export abstract class Task implements ITask {
    request: ITaskRequest;
    abstract category: TaskCategory;
    abstract type: TaskType;
    abstract run(): void
    abstract canAssign(workerId: string): boolean
    public abstract addRequests(roomName: string): void;

    constructor(taskRequest: ITaskRequest){

        this.request = taskRequest;
    }
    protected validateOwnedRoom(roomName: string) : Room | undefined{
        const room = Game.rooms[roomName];
        if(room?.controller === (null || undefined)) {
            Logger.LogWarning(`Tried to add a ${this.type} task for an unowned room.. enable if you need to.`)
            return undefined;
        }

        if(room.controller.owner?.username != global.owner){
            Logger.LogTrace(`Tried to add ${this.type} tasks for a non-owned room... enable if you need to`);
            return undefined;
        }
        return room;
    }
}
