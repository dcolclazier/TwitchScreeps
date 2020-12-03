import { StructureTaskType } from "core/types";
import { TaskFactory } from "core/TaskFactory";
import { Logger } from "utils/Logger";
import { StructureTaskRequest } from "tasks/model/StructureTaskRequest";
import { StructureTask } from "tasks/base/StructureTask";


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

        this.getStructureMemory(structureId).currentTaskStatus = "WORKING";
    }

    protected work(structureId: Id<StructureTower>): void {

        Logger.LogTrace(`In DefendRoomTowerTask::work: id = ${structureId}`);
        const tower = Game.getObjectById(structureId) as StructureTower;

        const mem = this.getStructureMemory(structureId);
        const enemies = Game.rooms[tower.room.name].find(FIND_HOSTILE_CREEPS);
        if (enemies.length === 0){
            mem.currentTaskStatus = "DONE";
            return;
        }

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

        if(!_.any(global.taskManager.getTasks(roomName, StructureTaskType.DefendRoomTask))){
            global.taskManager.addTaskRequest(new DefendRoomTowerRequest(firstTowerId, roomName));
        }
    }

}
