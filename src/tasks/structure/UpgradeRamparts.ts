import { TaskFactory } from "core/TaskFactory";
import { StructureTaskType } from "core/types";
import { StructureTask } from "tasks/base/StructureTask";
import { StructureTaskRequest } from "tasks/model/StructureTaskRequest";
import { Logger } from "utils/Logger";



export class UpgradeRampartsRequest extends StructureTaskRequest{
    structureType: StructureConstant = STRUCTURE_TOWER
    usesTargetId: boolean = false;
    type: StructureTaskType = StructureTaskType.UpgradeRamparts

    constructor(targetRoom: string){
        super(targetRoom, undefined);
    }

}
@TaskFactory.register
export class UpgradeRampartsTask extends StructureTask<StructureTower> {
    canAssign(workerId: string): boolean {
        const tower = Game.getObjectById(workerId as Id<StructureTower>);
        if(tower === null) return false;
        if(tower.store.energy <= tower.store.getCapacity(RESOURCE_ENERGY) / 2) return false;

        return true;
    }

    public structureType: StructureConstant = STRUCTURE_TOWER;
    public type: StructureTaskType = StructureTaskType.UpgradeRamparts

    protected prepare(structureId: Id<StructureTower>): void {
        const memory = this.getMemory(structureId);
        if(memory === undefined){
            Logger.LogError(`Memory for ${this.structureType}${structureId} was undefined!`);
            return;
        }
        memory.currentTaskStatus = "WORKING";
    }

    protected work(structureId: Id<StructureTower>): void {


        const tower = Game.getObjectById(structureId) as StructureTower;
        const memory = this.getMemory(structureId)!;
        if(tower === undefined || tower === null) return;

        if(_.any(global.taskManager.getTasks(tower.room.name, StructureTaskType.DefendRoomTask))){
            memory.currentTaskStatus = "DONE";
            return;
        }
        if(tower.store.energy <= tower.store.getCapacity(RESOURCE_ENERGY) / 2) {
            this.unassignStructure(structureId);

            return;
        }


        const ramparts = Game.rooms[tower.room.name].find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType == "rampart"
        });
        const lowest = _.first(_.sortBy(ramparts, r=> r.hits));
        const result = tower.repair(lowest);
        if(result != OK){
            Logger.LogTrace(`Tower couldn't repair rampart: ${result}`);
        }

    }
    unassignStructure(structureId: Id<StructureTower>) {

        const memory = this.getMemory(structureId);
        if(memory){
            memory.currentTaskStatus = "WAITING";
            memory.currentTaskId = "";
        }
        const request = this.request as StructureTaskRequest;
        _.remove(request.structuresAssigned, structureId);
    }

    protected cooldown(structureId: Id<StructureTower>): void {
    }


    public addRequests(roomName: string): void {

        const ramparts = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType == "rampart"
        });
        if(ramparts.length == 0) return;

        const min = _.min(ramparts, r=>r.hits).hits;
        if(min >= 5000000) return;

        const storage = Game.rooms[roomName].storage;
        if(storage === undefined) return;

        if(storage.store.energy <= storage.store.getCapacity() / 2) return;

        const defendTasks = global.taskManager.getTasks(roomName, StructureTaskType.DefendRoomTask);
        if(_.any(defendTasks)) return;

        const tasks = global.taskManager.getTasks(roomName, StructureTaskType.UpgradeRamparts);
        if(tasks.length == 0){
            global.taskManager.addTaskRequest(new UpgradeRampartsRequest(roomName))
        }





        //global.taskManager.addTaskRequest();

    }

}
