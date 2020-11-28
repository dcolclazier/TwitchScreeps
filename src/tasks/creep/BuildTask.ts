import { Utility } from "core/Utility";
import { CreepTask } from "../base/CreepTask";
import { CreepTaskRequest } from "../base/CreepTaskRequest";
import TaskType, { CreepTaskType, JobType } from "../../contract/types";
import { ITaskCatalog } from "contract/ITaskCatalog";

export class BuildTaskRequest extends CreepTaskRequest {
    jobType: JobType = JobType.Builder;
    creepsNeeded: number = 1;
    type: TaskType = CreepTaskType.BuildTask;
    usesTargetId: boolean = true;
    constructor(constructionSiteId: Id<ConstructionSite>, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, constructionSiteId);

    }
}
@ITaskCatalog.register
export class BuildTask extends CreepTask {


    image: string = "🚧";
    type: TaskType = CreepTaskType.BuildTask

    protected prepare(creepName: string): void {

        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "PREPARING")
            return;

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
        global.util.room.fillup(creep.name, RESOURCE_ENERGY);

        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) >= energyNeeded
            || creep.store.getFreeCapacity() == 0)
            {
                creep.memory.currentTaskStatus = "WORKING";
                return;
            }

    }
    protected work(creepName: string): void {

        if (creepName === "") return;
        const creep = Game.creeps[creepName];
        if(creep.memory.currentTaskStatus != "WORKING") return;

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
              console.log("Adding a build task")
              global.taskManager.addTaskRequest(new BuildTaskRequest(site.id, roomName, roomName));
            }
          }
        }
    }
    public getSpawnInfo(roomName: string): SpawnInfo {

        return this._getSpawnInfo(roomName, JobType.Builder, CreepTaskType.BuildTask, () => true);
    }
}



