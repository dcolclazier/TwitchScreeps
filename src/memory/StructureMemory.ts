

export abstract class StructureMemory<T extends OwnedStructure> implements IStructureMemory {
    id: Id<T>;
    currentTaskId: string = ""
    currentTaskStatus: TaskStatus = "WAITING"
    abstract acceptedTaskTypes: import("../core/types").TaskType[]
    abstract structureType: StructureConstant;
    constructor(id: Id<T>) {
        this.id = id;
    }

}

export abstract class RoomObjectMemory<T extends RoomObject>{
    id: Id<T>;
    abstract roomObjectType: RoomObjectConstant;

    constructor(id: Id<T>){ this.id = id}
}
