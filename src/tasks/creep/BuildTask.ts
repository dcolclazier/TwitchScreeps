import { CreepTask } from "../base/CreepTask";
import { CreepTaskRequest } from "../model/CreepTaskRequest";
import TaskType, { CreepTaskType } from "../../core/types";
import { Logger } from "utils/Logger";
import { TaskFactory } from "core/TaskFactory";

export class BuildTaskRequest extends CreepTaskRequest {

    type: CreepTaskType = CreepTaskType.BuildTask;
    usesTargetId: boolean = true;

    constructor(constructionSiteId: Id<ConstructionSite>, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, constructionSiteId);
    }
}

@TaskFactory.register
export class BuildTask extends CreepTask {
    canAssign(taskType: TaskType): boolean {
        return true;
    }

    image: string = "🚧";
    type: CreepTaskType = CreepTaskType.BuildTask

    protected prepare(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "PREPARING")
            return;

        if(this.request.targetId === undefined) return;
        const site = Game.getObjectById(this.request.targetId) as ConstructionSite;
        var energyNeeded = site.progressTotal;
        if(energyNeeded === undefined || energyNeeded == 0) {
            creep.memory.currentTaskStatus = "DONE";
            return;
        }

        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) >= energyNeeded){
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


    protected work(creepName: string): void {

        const creep = Game.creeps[creepName];
        if(creep.memory.currentTaskStatus != "WORKING") return;

        if(this.request.targetId === undefined) return;
        const site = Game.getObjectById(this.request.targetId) as ConstructionSite;

        if(site === (undefined || null) || site.progressTotal === 0){
            creep.memory.currentTaskStatus = "DONE";
            return;
        }
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.currentTaskStatus = "PREPARING";
            return;
        }

        if(creep.build(site) === ERR_NOT_IN_RANGE){
            creep.moveTo(site);
        }

    }

    protected cooldown(creepName: string): void {
        //Not used for this task
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

