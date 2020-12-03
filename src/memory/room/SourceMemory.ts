import TaskType from "../../core/types";
import { RoomObjectMemory } from "memory/base/RoomObjectMemory";
import { MemoryHandlerFactory } from "core/MemoryHandlerFactory";
import { Logger } from "utils/Logger";
import { RoomObjectMemoryHandler } from "memory/base/MemoryHandler";

@MemoryHandlerFactory.register
export class SourceMemoryHandler implements RoomObjectMemoryHandler{
    memoryObjectType: RoomObjectConstant = "source";
    registerMemory(roomName: string, id: string): void {
        const memory = new SourceMemory(id as Id<Source>);
        Logger.LogDebug(`Registering memory for source ${id}`);
        Memory.rooms[roomName].sources.push(memory);
    }
}
export class SourceMemory extends RoomObjectMemory<Source> {
    roomObjectType: RoomObjectConstant = "source";
    acceptedTaskTypes: TaskType[] = [];
    constructor(id: Id<Source>) {
        super(id);
    }
}
