import { CreepTask } from "../base/CreepTask";
import { CreepTaskRequest } from "../model/CreepTaskRequest";
import TaskType, { CreepTaskType } from "../../core/types";
import { Logger } from "utils/Logger";
import { TaskFactory } from "core/TaskFactory";
import { Position } from "source-map";
import { MemoryHandlerFactory } from "core/MemoryHandlerFactory";

export class BuildTaskRequest extends CreepTaskRequest {

    type: CreepTaskType = CreepTaskType.BuildTask;
    usesTargetId: boolean = true;

    constructor(constructionSiteId: Id<ConstructionSite>, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, constructionSiteId);
    }
}

@TaskFactory.register
export class BuildTask extends CreepTask {
    buildingType: keyof AllLookAtTypes = "constructionSite";
    canAssign(taskType: TaskType): boolean {
        return true;
    }

    image: string = "🚧";
    type: CreepTaskType = CreepTaskType.BuildTask
    sitePos: RoomPosition | undefined;

    protected prepare(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "PREPARING")
            return;

        if(this.request.targetId === undefined) return;
        const site = Game.getObjectById(this.request.targetId) as ConstructionSite;
        if(site === null || site === undefined){
            creep.memory.currentTaskStatus = "COOLDOWN";
            return;
        }
        this.sitePos = site.pos;
        this.buildingType = site.structureType as keyof AllLookAtTypes;

        var energyNeeded = site.progressTotal;
        if(energyNeeded === undefined || energyNeeded == 0) {
            creep.memory.currentTaskStatus = "COOLDOWN";
            return;
        }

        var usedCap = creep.store.getUsedCapacity(RESOURCE_ENERGY);
        if(usedCap >= energyNeeded || creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
            creep.memory.currentTaskStatus = "WORKING";
            return;
        }

        //go to a storage location, fill up on the resource required to build the thing
        global.util.room.fillup(creepName, RESOURCE_ENERGY, false);

        if(creep.store.getFreeCapacity() >= energyNeeded){
            creep.memory.currentTaskStatus = "WORKING";
        }

        Logger.LogTrace(`In ${CreepTaskType[this.type]}: ${creepName} free capacity: ${creep.store.getFreeCapacity() }`);

    }
    registerMemoryForBuilding(roomName: string) {
        var thing = _.first(Game.rooms[roomName].lookForAt(this.buildingType, this.sitePos?.x!, this.sitePos?.y!)) as OwnedStructure;
        var ctor = MemoryHandlerFactory.getHandler(thing.structureType);
        if(ctor === undefined){
            Logger.LogWarning(`No memory handler found for ${thing.structureType}... couldn't init memory for new building.`);
            return;
        }
        var handler = new ctor();
        handler.registerMemory(roomName, thing.id);
    }


    protected work(creepName: string): void {

        const creep = Game.creeps[creepName];

        if(creep.memory.currentTaskStatus != "WORKING") return;
        if(this.request.targetId === undefined) return;

        const site = Game.getObjectById(this.request.targetId) as ConstructionSite;
        if(site === undefined || site === null || site.progressTotal === 0){

            creep.memory.currentTaskStatus = "COOLDOWN";
            return;
        }
        if(this.sitePos === undefined){
            this.sitePos = site.pos;
            this.buildingType = site.structureType as keyof AllLookAtTypes;
        }

        if(creep.build(site) === ERR_NOT_IN_RANGE){
            creep.moveTo(site);
        }

        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.currentTaskStatus = "PREPARING";
        }
    }

    protected cooldown(creepName: string): void {
        const creep = Game.creeps[creepName];
        this.registerMemoryForBuilding(creep.room.name);
        creep.memory.currentTaskStatus = "DONE";
    }

    public getSpawnInfo(roomName: string): SpawnInfo[] {

        return this._getSpawnInfo(roomName, this.type, () => true);
    }

    public addRequests(roomName: string): void {
        const room = Game.rooms[roomName];
        if(room === null || room === undefined) return;

        var constructionSites = room.find(FIND_CONSTRUCTION_SITES);
        if(constructionSites.length > 0){
          for(let siteId in constructionSites){
            const site = constructionSites[siteId];
            const buildTasks = global.taskManager.getTasks(roomName, CreepTaskType.BuildTask) as BuildTaskRequest[];

            if(_.find(buildTasks, b => b.targetId === site.id) === undefined)
            {
                Logger.LogTrace(`Adding ${this.type} task to room ${roomName}`);
                global.taskManager.addTaskRequest(new BuildTaskRequest(site.id, roomName, roomName));
            }
          }
        }
    }
}

