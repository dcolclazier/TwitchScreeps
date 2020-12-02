import { StructureMemory } from "memory/StructureMemory";
import { Logger } from "utils/Logger";
import TaskType, { TaskCategory } from "../../core/types";
import { StructureTaskRequest } from "../model/StructureTaskRequest";
import { Task } from "./Task";


export abstract class StructureTask<T extends OwnedStructure> extends Task {

    public category: TaskCategory = TaskCategory.Structure;
    public abstract type: TaskType;
    public abstract structureType: StructureConstant;
    protected abstract work(structureId: Id<T>): void;
    protected abstract prepare(structureId: Id<T>): void;
    protected abstract cooldown(structureId: Id<T>): void;

    protected getMemory(structureId: Id<T>) : StructureMemory<T> | undefined{
        var s = Game.getObjectById(structureId);
        if(s === null) return undefined;
        return Memory.structures[s.room.name][this.structureType][structureId] as StructureMemory<T>;
    }
    public run(): void {

        if(this.request.targetRoom === undefined) return;
        const structureRequest = this.request as StructureTaskRequest;
        for (let id of structureRequest.structuresAssigned) {


            Logger.LogTrace(`Running structure task ${structureRequest.type} for ${id} in ${structureRequest.targetRoom}`);
            const structure = Game.getObjectById(id as Id<T>) as AnyOwnedStructure;
            if (structure === undefined || structure === null)
                continue;

            if(this.request.targetId === undefined && structureRequest.usesTargetId) return;
            if(structureRequest.usesTargetId){
                var target = Game.getObjectById(this.request.targetId!);
                if (target === null && structureRequest.usesTargetId) {
                    this.finish();
                    return;
                }
            }
            const memory = Memory.structures[this.request.targetRoom][this.structureType][id] as StructureMemory<T>;


            switch (memory.currentTaskStatus) {
                case "WAITING": memory.currentTaskStatus = "PREPARING"; break;
                case "PREPARING": this.prepare(id as Id<T>); break;
                case "WORKING": this.work(id as Id<T>); break;
                case "COOLDOWN": this.cooldown(id as Id<T>); break;
                case "DONE": this.finish(); break;
            }
        }
    }

    protected finish(): void {
        const structureRequest = this.request as StructureTaskRequest;
        this.request.isFinished = true;
        structureRequest.structuresAssigned = [];
    }

    constructor(request: StructureTaskRequest) {
        super(request);
    }
}
