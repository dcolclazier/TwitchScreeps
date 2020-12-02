
interface IMemoryHandler{
    registerMemory(roomName: string, id: string): void
    memoryObjectType: MemoryObjectConstant
}


interface IStructureMemory{
    acceptedTaskTypes: import("../core/types").TaskType[];
    structureType: StructureConstant;
    currentTaskId: string | undefined;
    currentTaskStatus: TaskStatus;
    id: string
}
