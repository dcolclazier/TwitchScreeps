import { StructureTaskType } from "core/types";
import { TaskFactory } from "core/TaskFactory";
import { Logger } from "utils/Logger";
import { StructureTaskRequest } from "tasks/model/StructureTaskRequest";
import { StructureTask } from "tasks/base/StructureTask";
import { StructureMemory } from "memory/StructureMemory";


export class DefendRoomTowerRequest extends StructureTaskRequest{
    structureType: StructureConstant = STRUCTURE_TOWER;
    usesTargetId: boolean = false;
    type: StructureTaskType = StructureTaskType.DefendRoomTask;

    constructor(towerId: Id<StructureTower>,targetRoom: string){
        super(targetRoom, towerId);
    }

}
@TaskFactory.register
export class DefendRoomTowerTask extends StructureTask<StructureTower> {
    canAssign(workerId: string): boolean {
        return true;
    }
    public structureType: StructureConstant = "tower";

    public type: StructureTaskType = StructureTaskType.DefendRoomTask;

    protected prepare(structureId: Id<StructureTower>): void {

        const tower = Game.getObjectById(structureId) as StructureTower;
        const structureMem = Memory.structures[tower.room.name][this.structureType][structureId] as StructureMemory<StructureTower>;
        structureMem.currentTaskStatus = "WORKING";
    }

    protected work(structureId: Id<StructureTower>): void {

        Logger.LogTrace(`In DefendRoomTowerTask::work: id = ${structureId}`);
        const tower = Game.getObjectById(structureId) as StructureTower;

        const towerMem = Memory.structures[tower.room.name][this.structureType][structureId] as StructureMemory<StructureTower>;

        const enemies = Game.rooms[tower.room.name].find(FIND_HOSTILE_CREEPS);

        if (enemies.length === 0)
            towerMem.currentTaskStatus = "DONE";

        const closeEnemies = _.filter(enemies, enemy => tower.pos.getRangeTo(enemy) < 8);
        if(closeEnemies.length === 0) return;

        const target = _.min(closeEnemies, enemy => enemy.hits);
        tower.attack(target);
    }

    protected cooldown(structureId: string): void {
    }


    public addRequests(roomName: string): void {

        const towers = _.map(Memory.structures[roomName][STRUCTURE_TOWER], m=> m);
        if(towers === undefined || towers == []) return;

        const enemies = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        if (enemies.length === 0)
            return;

        const firstTowerId = _.first(towers).id as Id<StructureTower>;

        global.taskManager.addTaskRequest(new DefendRoomTowerRequest(firstTowerId, roomName));

    }

}
