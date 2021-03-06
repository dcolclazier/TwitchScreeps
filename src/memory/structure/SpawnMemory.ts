import TaskType from "../../core/types";
import { StructureMemory } from "memory/base/StructureMemory";
import { MemoryHandlerFactory } from "core/MemoryHandlerFactory";
import { Logger } from "utils/Logger";
import { StructureMemoryHandler } from "memory/base/MemoryHandler";

@MemoryHandlerFactory.register
export class SpawnMemoryHandler implements StructureMemoryHandler{
    memoryObjectType: StructureConstant = STRUCTURE_SPAWN;
    registerMemory(roomName: string, id: string): void {
        const memory = new SpawnMemory(id as Id<StructureSpawn>);
        Logger.LogDebug(`Registering memory for spawn ${id}`);
        Memory.structures[roomName][this.memoryObjectType][id] = memory;
    }
}
export class SpawnMemory extends StructureMemory<StructureSpawn> {
    acceptedTaskTypes: TaskType[] = [];
    structureType: StructureConstant = STRUCTURE_SPAWN;

    constructor(id: Id<StructureSpawn>) {
        super(id);
    }

}
