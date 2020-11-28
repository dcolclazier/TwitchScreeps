import TaskType, { CreepTaskType, JobType, SpawnLevel, TaskCategory } from "../../contract/types";
import { CreepTaskRequest } from "./CreepTaskRequest";
import { Task } from "./Task";

export abstract class CreepTask extends Task
{
    request: CreepTaskRequest;
    category: TaskCategory = TaskCategory.Creep;

    abstract type: TaskType;
    abstract image: string;

    protected abstract work(creepName: string): void
    protected abstract prepare(creepName: string): void
    protected abstract cooldown(creepName: string): void
    public abstract getSpawnInfo(roomName: string): SpawnInfo

    //doesnt need to live here - this is governor shit...
    public static getSpawnLevel(roomName: string) : SpawnLevel{

        var janitors = _.filter(Game.creeps, c=> c.room.name === roomName && c.memory?.jobType === JobType.Janitor);
        var miners = _.filter(Game.creeps, c=> c.room.name === roomName && c.memory?.jobType === JobType.Miner);

        var minerWorkParts = _.sum(miners, miner=> miner.getActiveBodyparts(WORK));

        if(janitors.length === 0 || minerWorkParts < 1) return SpawnLevel.Level1;

        var totalEnergy = Game.rooms[roomName].energyCapacityAvailable;
        if(totalEnergy <= 300) return SpawnLevel.Level1;
        else if(totalEnergy <= 600) return SpawnLevel.Level2;

        //console.log("ERROR. Implement more spawn levels!");
        return SpawnLevel.Level2;
    }

    protected static spawnCreeps(roomName: string, jobType: JobType, taskType: CreepTaskType, predicate: () => boolean) : SpawnInfo{

        let toSpawn : SpawnInfo = {
            jobType:jobType,
            spawnCreep:false,
            spawnLevel:CreepTask.getSpawnLevel(roomName)
        };
        var creeps = _.filter(Game.creeps, c=> c.room.name === roomName && c.name.split("_")[1] as JobType == jobType);
        const currentTasks = global.taskManager.getTasks(roomName, taskType) as CreepTaskRequest[];
        const maxPerRoom = global.creepCatalog[jobType][toSpawn.spawnLevel].maxPerRoom;
        const creepsPerTask = global.taskCatalog[taskType].creepsPerTask;
        const currentCreepCount = creeps.length;

        if(currentCreepCount >= maxPerRoom) return toSpawn;

        if(!_.any(currentTasks)) return toSpawn;

        if(currentCreepCount >= creepsPerTask * currentTasks.length) return toSpawn;

        toSpawn.spawnCreep = predicate();
        // if(toSpawn.spawnCreep)console.log(`${taskType}: currentT:${currentTasks.length}, perTask:${creepsPerTask} currentC:${currentCreepCount}, maxPerRoom: ${maxPerRoom}, toSpawn:${JSON.stringify(toSpawn)}`);
        return toSpawn;
    }

    public run() : void {
        for(let id in this.request.creepsAssigned){
            const creepName = this.request.creepsAssigned[id];
            const creep = Game.creeps[creepName];
            if(creep === undefined || creep === null) continue;
            if(creep.spawning) continue;

            var target = Game.getObjectById(this.request.targetId);
            if(target === null && this.request.usesTargetId){
                console.log(`target was null... usesTargetId = true.`)
                this.finish();
                return;
            }

            if(creep.memory.currentTaskId != this.request.id){
                creep.memory.currentTaskId = this.request.id;
            }
            switch(creep.memory.currentTaskStatus){
                case "WAITING": creep.memory.currentTaskStatus = "PREPARING"; break;
                case "PREPARING": this.prepare(creep.name); break;
                case "WORKING": this.work(creep.name); break;
                case "COOLDOWN": this.cooldown(creep.name); break;
                case "DONE": this.finish(); break;
            }
        }

    }

    protected finish(): void{
        this.request.isFinished = true;
        for(let creepName of this.request.creepsAssigned){
            const creep = Game.creeps[creepName];
            if(creep !== undefined){
                // console.log(`Unassigning ${creepName} from finished task ${this.request.type}${this.request.id}`);
                creep.memory.currentTaskId = "";
                creep.memory.currentTaskStatus = "WAITING"
            }
        }
        this.request.creepsAssigned = [];
    }
    constructor(taskRequest: CreepTaskRequest){
        super();
        this.request = taskRequest;
    }

}


