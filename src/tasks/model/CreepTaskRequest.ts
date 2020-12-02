import TaskType, { CreepTaskType, TaskCategory } from "../../core/types";


export abstract class CreepTaskRequest implements ITaskRequest {
    category: TaskCategory = TaskCategory.Creep;
    id: string = global.util.getUniqueId();
    targetRoom: string;
    creepsAssigned: string[] = [];
    originatingRoom: string;
    targetId: Id<RoomObject>;
    isFinished: boolean = false;
    abstract usesTargetId: boolean;
    abstract type: CreepTaskType;

    constructor(originatingRoom: string, targetRoom: string, targetId: Id<RoomObject>) {
        this.originatingRoom = originatingRoom;
        this.targetRoom = targetRoom;
        this.targetId = targetId;
    }
}



