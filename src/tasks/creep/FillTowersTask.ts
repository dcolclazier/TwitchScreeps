import { CreepTask } from "../base/CreepTask";
import { CreepTaskType } from "../../core/types";
import { TaskFactory } from "core/TaskFactory";
import { Logger } from "utils/Logger";
import { CreepTaskRequest } from "../model/CreepTaskRequest";

export class FillTowersRequest extends CreepTaskRequest{
    usesTargetId: boolean = true;
    type: CreepTaskType = CreepTaskType.FillTowersTask;

    constructor(towerId: Id<StructureTower>, originatingRoom: string, targetRoom: string){
        super(originatingRoom, targetRoom, towerId);
    }

}

@TaskFactory.register
export class FillTowersTask extends CreepTask {

    image: string = "🚧";
    type: CreepTaskType = CreepTaskType.FillTowersTask;
    canAssign(workerId: string): boolean {
        return true;
    }
    protected prepare(creepName: string): void {

        const creep = Game.creeps[creepName];

        if (creep.memory.currentTaskStatus !== "PREPARING") return;

        global.util.room.fillup(creepName, RESOURCE_ENERGY, false);

        if(creep.store.getFreeCapacity() == 0){
            creep.memory.currentTaskStatus = "WORKING";
        }

        Logger.LogTrace(`In ${CreepTaskType[this.type]}: ${creepName} free capacity: ${creep.store.getFreeCapacity() }`);
    }

    protected work(creepName: string): void {


        const creep = Game.creeps[creepName];
        if (creep.memory.currentTaskStatus != "WORKING") return;

        if(this.request.targetId === undefined) return;
        const tower = Game.getObjectById(this.request.targetId) as StructureTower;

        if (tower.store.energy >= tower.store.getCapacity(RESOURCE_ENERGY) * .85) {
            creep.memory.currentTaskStatus = "DONE";
            return;
        }
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.currentTaskStatus = "PREPARING";
            return;
        }

        if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(tower);
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
        if (room === null || room === undefined)
            return;

        const towers = Memory.structures[roomName][STRUCTURE_TOWER];
        if (towers === undefined || towers === {}) return;

        for (let id in towers) {
            const memory = towers[id];
            const tower = Game.getObjectById<StructureTower>(memory.id as Id<StructureTower>);
            if(tower === null) continue;
            // const tower = towers[siteId] as StructureTower;
            const towerTasks = global.taskManager.getTasks(roomName, CreepTaskType.FillTowersTask) as FillTowersRequest[];
            if(tower.store === null || tower.store === undefined) continue;

            if(tower.store.energy >= tower.store.getCapacity(RESOURCE_ENERGY) * .85) continue;

            if (_.find(towerTasks, b => b.targetId === tower.id) === undefined) {

                global.taskManager.addTaskRequest(new FillTowersRequest(tower.id, roomName, roomName));
            }
        }
    }
}



