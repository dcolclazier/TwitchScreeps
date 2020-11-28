import TaskType, { JobType, TaskCategory } from "../../contract/types";


export abstract class CreepTaskRequest implements ITaskRequest {
    category: TaskCategory = TaskCategory.Creep;
    id: string = global.util.getUniqueId();
    targetRoom: string = "";
    originatingRoom: string = "";
    creepsAssigned: string[] = [];
    targetId: Id<RoomObject>;
    isFinished: boolean = false;
    abstract usesTargetId: boolean;
    abstract type: TaskType;
    // abstract acceptedJobTypes: JobType[]

    constructor(originatingRoom: string, targetRoom: string, targetId: Id<RoomObject>) {
        this.originatingRoom = originatingRoom;
        this.targetRoom = targetRoom;
        this.targetId = targetId;
    }
}
