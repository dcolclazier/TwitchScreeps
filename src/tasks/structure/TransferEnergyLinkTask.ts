import { LinkType, StructureTaskType } from "core/types";
import { TaskFactory } from "core/TaskFactory";
import { Logger } from "utils/Logger";
import { StructureTaskRequest } from "tasks/model/StructureTaskRequest";
import { StructureTask } from "tasks/base/StructureTask";
import { LinkMemory } from "memory/structure/LinkMemory";


export class TransferEnergyLinkRequest extends StructureTaskRequest{
    structureType: StructureConstant = STRUCTURE_LINK
    usesTargetId: boolean = true;
    type: StructureTaskType = StructureTaskType.TransferEnergyLinkTask
    constructor(targetRoom: string, idsToAssign: Id<StructureLink>[]){

        super(targetRoom, undefined);
        this.structuresAssigned = idsToAssign;
    }
}

@TaskFactory.register
export class TransferEnergyLinkTask extends StructureTask<StructureLink> {
    canAssign(workerId: string): boolean {
        return true;
    }

    public structureType: StructureConstant = "link";
    public type: StructureTaskType = StructureTaskType.TransferEnergyLinkTask
    private targetId: Id<StructureLink> | undefined
    private sendThreshold : number = .9;

    protected prepare(structureId: string): void {

        const memory = this.getMemory(structureId as Id<StructureLink>);
        if(memory === undefined){
            Logger.LogError(`Memory for ${this.structureType}${structureId} was undefined!`);
            return;
        }
        if(this.targetId === undefined){

            const links = _.map(Memory.structures[this.request.targetRoom][this.type], s=> s) as LinkMemory[];

            const target = _.find(links, l => l.linkType === LinkType.Storage)
            if(target === undefined) return;

            this.targetId = target.id;
        }

        const target = Game.getObjectById(this.targetId) as StructureLink;
        if(target === null || target === undefined) throw new Error()

        // const linkInfo = Game.rooms[target.room.name].memory.links[target.id];
        const linkInfo = Memory.structures[target.room.name][this.type][target.id] as LinkMemory;
        if(linkInfo.linkType != LinkType.Storage) {
            Logger.LogWarning(`Link target ${this.targetId} is not a storage link...`);
        }
        memory.currentTaskStatus = "WORKING";
    }

    protected work(structureId: string): void {
        if(this.targetId === undefined) throw Error("this should never happen.");

        const memory = this.getMemory(structureId as Id<StructureLink>);
        if(memory === undefined){
            Logger.LogError(`Memory for ${this.structureType}${structureId} was undefined!`);
            return;
        }
        const target = Game.getObjectById(this.targetId) as StructureLink;

        if(target === null || target === undefined){
            memory.currentTaskStatus = "PREPARING";
            return;
        }
        if(target.store.getCapacity(RESOURCE_ENERGY) == 0) return;

        // we have a target, if we need to send, send.
        const structureRequest = this.request as StructureTaskRequest;
        for(let id in structureRequest.structuresAssigned){

            const myId = structureRequest.structuresAssigned[id];
            // const linkInfo = Game.rooms[this.request.targetRoom].memory.links[myId];
            const linkInfo = Memory.structures[target.room.name][this.type][target.id] as LinkMemory;
            if(linkInfo === undefined){
                Logger.LogError(`Couldn't find link info for link with id of ${myId}`);
                continue;
            }
            const thisLink = Game.getObjectById(linkInfo.id) as StructureLink;

            if(thisLink.store.energy >= thisLink.store.getCapacity(RESOURCE_ENERGY) * this.sendThreshold){

                const result = thisLink.transferEnergy(target);
                Logger.LogDebug(result.toString())
            }
        }


    }

    protected cooldown(structureId: string): void {
    }


    public addRequests(roomName: string): void {

        const tasks = global.taskManager.getTasks(roomName, StructureTaskType.TransferEnergyLinkTask);
        const links = _.map(Memory.structures[roomName][this.type], s=>s) as LinkMemory[];

        const canSend = _.map(_.filter(links, l => l.shouldSend), l => l.id)
        if(canSend === []) return;

        if(!_.any(tasks)){

            global.taskManager.addTaskRequest(new TransferEnergyLinkRequest(roomName, canSend));
        }
        else{
            if(tasks.length > 1) {
                Logger.LogError(`More than one transfer energy task found for ${roomName}`);
            }
            var task = _.first(tasks) as StructureTaskRequest;
            for(let id of canSend){
                if(!_.contains(task.structuresAssigned, id)){
                    task.structuresAssigned.push(id);
                }
            }
        }
    }
}

