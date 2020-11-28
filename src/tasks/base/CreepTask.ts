import { Governor } from "core/Governor";
import { Logger } from "utils/Logger";
import TaskType, { CreepTaskType, JobType, SpawnLevel, TaskCategory } from "../../contract/types";
import { CreepTaskRequest } from "./CreepTaskRequest";
import { Task } from "./Task";

export abstract class CreepTask extends Task
{
    request: CreepTaskRequest;
    category: TaskCategory = TaskCategory.Creep;

    abstract type: TaskType;
    abstract image: string;
    // abstract acceptedJobTypes: JobType[]

    protected abstract work(creepName: string): void
    protected abstract prepare(creepName: string): void
    protected abstract cooldown(creepName: string): void
    public abstract getSpawnInfo(roomName: string): SpawnInfo[]

    protected _getSpawnInfo(roomName: string, taskType: TaskType, predicate: () => boolean) : SpawnInfo[]{

        const toReturn : SpawnInfo[] = [];
        const spawnLevel = Governor.getSpawnLevel(roomName);
        const jobTypes = global.taskCatalog[taskType][spawnLevel].acceptedJobTypes;
        for(let id in jobTypes){
            const jobType = jobTypes[id];
            const spawnInfo : SpawnInfo = {
                jobType:jobType,
                spawnCreep:false,
                spawnLevel:Governor.getSpawnLevel(roomName)
            };
            const creeps = _.filter(Game.creeps, c=> c.room.name === roomName && c.name.split("_")[1] as JobType == jobType);
            const currentTasks = global.taskManager.getTasks(roomName, taskType) as CreepTaskRequest[];
            const creepsPerTask = global.taskCatalog[taskType][spawnInfo.spawnLevel].creepsPerTask[jobType];

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
    protected validateOwnedRoom(roomName: string) : Room | undefined{
        const room = Game.rooms[roomName];
        if(room?.controller === (null || undefined)) {
            Logger.LogWarning(`Tried to add a ${this.type} task for an unowned room.. enable if you need to.`)
            return undefined;
        }

        if(room.controller.owner?.username != global.owner){
            Logger.LogTrace(`Tried to add ${this.type} tasks for a non-owned room... enable if you need to`);
            return undefined;
        }
        return room;
    }
    public run() : void {

        for(let id in this.request.creepsAssigned){

            const creep = Game.creeps[this.request.creepsAssigned[id]];
            if(creep === undefined || creep === null) continue;
            if(creep.spawning) continue;

            var target = Game.getObjectById(this.request.targetId);
            if(target === null && this.request.usesTargetId){
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
        this.request.isFinished = true;
        for(let creepName of this.request.creepsAssigned){
            const creep = Game.creeps[creepName];
            if(creep !== undefined){
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


