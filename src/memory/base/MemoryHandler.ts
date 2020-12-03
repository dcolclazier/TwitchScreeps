export abstract class MemoryHandler implements IMemoryHandler{
    abstract registerMemory(roomName: string, id: string): void;
    abstract memoryObjectType: MemoryObjectConstant;

}

export abstract class StructureMemoryHandler extends MemoryHandler {
    abstract memoryObjectType: StructureConstant;
}

export abstract class RoomObjectMemoryHandler extends MemoryHandler{
    abstract memoryObjectType: RoomObjectConstant
}
