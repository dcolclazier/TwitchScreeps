import TaskType, { StructureTaskType } from "core/types";
import { StructureMemory } from "memory/base/StructureMemory";
import { MemoryHandlerFactory } from "core/MemoryHandlerFactory";
import { Logger } from "utils/Logger";
import { StructureMemoryHandler } from "memory/base/MemoryHandler";

@MemoryHandlerFactory.register
export class TowerMemoryHandler implements StructureMemoryHandler{
    memoryObjectType: StructureConstant = STRUCTURE_TOWER;
    registerMemory(roomName: string, id: string): void {
        const memory = new TowerMemory(id as Id<StructureTower>);
        Logger.LogDebug(`Registering memory for tower ${id}`);
        Memory.structures[roomName][this.memoryObjectType][id] = memory;
    }
}
export class TowerMemory extends StructureMemory<StructureTower> {
    acceptedTaskTypes: TaskType[] = [StructureTaskType.DefendRoomTask, StructureTaskType.UpgradeRamparts];
    structureType: StructureConstant = STRUCTURE_TOWER;

    constructor(id: Id<StructureTower>) {
        super(id);
    }

}
