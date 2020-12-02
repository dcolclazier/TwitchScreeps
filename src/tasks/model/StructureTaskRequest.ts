import TaskType, { StructureTaskType, TaskCategory } from "../../core/types";



export abstract class StructureTaskRequest implements ITaskRequest {

    category: TaskCategory = TaskCategory.Structure;
    id: string = global.util.getUniqueId();
    targetRoom: string;
    isFinished: boolean = false;
    structuresAssigned: string[] = [];
    // currentTaskStatus: TaskStatus = "WAITING";

    targetId: Id<RoomObject> | undefined;
    abstract usesTargetId: boolean;
    abstract type: StructureTaskType;
    abstract structureType: StructureConstant;

    constructor(room: string, targetId: Id<RoomObject> | undefined) {
        this.targetId = targetId;

        this.targetRoom = room;
    }
}
