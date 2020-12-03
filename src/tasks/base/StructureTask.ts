import { StructureMemory } from "memory/base/StructureMemory";
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

    public run(): void {

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
            const memory = this.getStructureMemory(id as Id<T>);
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
        for(let id of structureRequest.structuresAssigned){
            const mem = this.getStructureMemory(id as Id<T>);
            mem.currentTaskId = "";
            mem.currentTaskStatus = "WAITING";
        }
        this.request.isFinished = true;
        structureRequest.structuresAssigned = [];
    }

    protected unassignStructure(id: Id<T>): void{

        const mem = this.getStructureMemory(id);
        mem.currentTaskId = "";
        mem.currentTaskStatus = "WAITING";

        const req = this.request as StructureTaskRequest;
        req.structuresAssigned = _.filter(req.structuresAssigned, s => s != id)
    }

    protected getStructureMemory(structureId: Id<T>) : StructureMemory<T>{
        var s = Game.getObjectById(structureId);
        if(s === null) throw new Error(`Tried to get memory for an object that doesn't have memory!!!! ${this.structureType}`);
        return Memory.structures[s.room.name][this.structureType][structureId] as StructureMemory<T>;
    }

    constructor(request: StructureTaskRequest) {
        super(request);
    }
}
