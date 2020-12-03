import TaskType from "../../core/types";
import { StructureMemory } from "memory/base/StructureMemory";
import { MemoryHandlerFactory } from "core/MemoryHandlerFactory";
import { Logger } from "utils/Logger";
import { StructureMemoryHandler } from "memory/base/MemoryHandler";

@MemoryHandlerFactory.register
export class ControllerMemoryHandler implements StructureMemoryHandler{
    memoryObjectType: StructureConstant = STRUCTURE_CONTROLLER;
    registerMemory(roomName: string, id: string): void {
        const memory = new ControllerMemory(id as Id<StructureController>);
        
        Memory.structures[roomName][this.memoryObjectType][id] = memory;
    }
}
export class ControllerMemory extends StructureMemory<StructureController> {
    acceptedTaskTypes: TaskType[] = [];
    structureType: StructureConstant = STRUCTURE_CONTROLLER;

    constructor(id: Id<StructureController>) {
        super(id);
    }

}
