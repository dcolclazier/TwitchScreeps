import { Governor } from "core/Governor";
import { CreepTaskType, JobType, TaskCategory } from "../../core/types";
import { CreepTaskRequest } from "../model/CreepTaskRequest";
import { Task } from "./Task";

export abstract class CreepTask extends Task
{
    category: TaskCategory = TaskCategory.Creep;

    abstract type: CreepTaskType;
    abstract image: string;

    protected abstract work(creepName: string): void
    protected abstract prepare(creepName: string): void
    protected abstract cooldown(creepName: string): void
    public abstract getSpawnInfo(roomName: string): SpawnInfo[]

    protected _getSpawnInfo(roomName: string, taskType: CreepTaskType, predicate: () => boolean) : SpawnInfo[]{

        const toReturn : SpawnInfo[] = [];
        const spawnLevel = Governor.getSpawnLevel(roomName);
        const jobTypes = global.creepTaskCatalog[taskType][spawnLevel].acceptedJobTypes;
        for(let id in jobTypes){
            const jobType = jobTypes[id];
            const spawnInfo : SpawnInfo = {
                jobType:jobType,
                spawnCreep:false,
                spawnLevel:Governor.getSpawnLevel(roomName)
            };
            const creeps = _.filter(Game.creeps, c=> c.room.name === roomName && c.name.split("_")[1] as JobType == jobType);
            const currentTasks = global.taskManager.getTasks(roomName, taskType) as CreepTaskRequest[];
            const creepsPerTask = global.creepTaskCatalog[taskType][spawnInfo.spawnLevel].creepsPerTask[jobType];

            if(creeps.length >= global.creepCatalog[jobType][spawnInfo.spawnLevel].maxPerRoom) {
                toReturn.push(spawnInfo);
                continue;
            };
            if(!_.any(currentTasks)) {
                toReturn.push(spawnInfo);
                continue;
            };
            if(creeps.length >= creepsPerTask * currentTasks.length) {
                toReturn.push(spawnInfo);
                continue;
            }

            spawnInfo.spawnCreep = predicate();
            toReturn.push(spawnInfo);
        }
        return toReturn;
    }

    public run() : void {

        const creepRequest = this.request as CreepTaskRequest;
        for(let id in creepRequest.creepsAssigned){

            const creep = Game.creeps[creepRequest.creepsAssigned[id]];
            if(creep === undefined || creep === null) continue;
            if(creep.spawning) continue;


            if(this.request.targetId === undefined) return;
            var target = Game.getObjectById(this.request.targetId);
            if(target === null && creepRequest.usesTargetId){
                this.finish();
                return;
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

        const creepRequest = this.request as CreepTaskRequest;
        this.request.isFinished = true;
        for(let creepName of creepRequest.creepsAssigned){
            const creep = Game.creeps[creepName];
            if(creep !== undefined){
                creep.memory.currentTaskId = "";
                creep.memory.currentTaskStatus = "WAITING"
            }
        }
        creepRequest.creepsAssigned = [];
    }
    constructor(taskRequest: CreepTaskRequest){
        super(taskRequest);
    }

}


