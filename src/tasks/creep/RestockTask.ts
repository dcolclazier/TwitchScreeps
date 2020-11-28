import { CreepTask } from ".././base/CreepTask";
import { CreepTaskRequest } from ".././base/CreepTaskRequest";
import TaskType, { CreepTaskType, JobType } from "../../contract/types";
import { ITaskCatalog as ITaskCatalog } from "contract/ITaskCatalog";


export class RestockTaskRequest extends CreepTaskRequest {
    jobType: JobType = JobType.Janitor;
    type: TaskType = CreepTaskType.RestockTask;
    usesTargetId: boolean = false;

    constructor(resourceLocationId: any, originatingRoom: string, targetRoom: string) {
        super(originatingRoom, targetRoom, resourceLocationId);

    }
}

@ITaskCatalog.register
export class RestockTask extends CreepTask {
    getSpawnInfo(roomName: string): SpawnInfo {
        return {
            jobType:JobType.Janitor,
            spawnCreep:false,
            spawnLevel:CreepTask.getSpawnLevel(roomName)
        }
    }
    type: TaskType = CreepTaskType.RestockTask;
    image: string = "🛒";
    currentRestockId: string | undefined = undefined;

    public addRequests(roomName: string): void {

        const room = Game.rooms[roomName];
        if(room?.controller === (null || undefined)) return;
        var restockTasks = global.taskManager.getTasks(roomName, CreepTaskType.RestockTask) as CreepTaskRequest[];

        if(!_.any(restockTasks)){
            global.taskManager.addTaskRequest(new RestockTaskRequest(room.controller.id, roomName, roomName))
        }

    }

    protected prepare(creepName: string): void {
        const creep = Game.creeps[creepName];

        if (creep.memory.currentTaskStatus !== "PREPARING")
            return;

        const restockTargets = global.util.room.getRestockables(creep.room.name);
        if (restockTargets.length === 0) {
            creep.memory.currentTaskStatus = "DONE";
            return;
        }

        const pickedUp = global.util.room.fillup(creepName, RESOURCE_ENERGY, true);

        if (creep.store.getFreeCapacity() === 0
            || creep.store.getFreeCapacity() != 0 && !pickedUp) {
            creep.memory.currentTaskStatus = "WORKING";
            return;
        }

    }

    private getNextRestockId(creepName: string): string {

        const creep = Game.creeps[creepName];
        const restockables = global.util.room.getRestockables(creep.room.name)
            .sort((structureA, structureB) => creep.pos.getRangeTo(structureA) - creep.pos.getRangeTo(structureB));

        if (restockables.length === 0)
            return "";
        else {
            const id = restockables[0].id;
            return id === undefined ? "" : id;
        }
    }
    protected work(creepName: string): void {

        const creep = Game.creeps[creepName];

        if (creep.memory.currentTaskStatus != "WORKING")
            return;

        if (this.currentRestockId === undefined) {
            this.currentRestockId = this.getNextRestockId(creepName);
            if (this.currentRestockId === undefined) {
                creep.memory.currentTaskStatus = "DONE";
            }
        }
        if(creep.store.getUsedCapacity() == 0){
            creep.memory.currentTaskStatus = "PREPARING";
        }

        const target = <StructureExtension | StructureSpawn>Game.getObjectById(this.currentRestockId);

        var result = creep.transfer(target, _.findKey(creep.store) as ResourceConstant)
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
    protected cooldown(creepName: string): void {
    }
    public static getSpawnInfo(roomName: string): SpawnInfo {

        return this.spawnCreeps(roomName, JobType.Janitor, CreepTaskType.RestockTask, () => true)

    }

}

RestockTask.name
