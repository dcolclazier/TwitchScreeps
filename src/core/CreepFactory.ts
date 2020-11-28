import { JobType, SpawnLevel, TaskCategory } from "contract/types";
import { ITaskCatalog } from "contract/ITaskCatalog";
import { CreepTask } from "tasks/base/CreepTask";
import { Governor } from "./Governor";
import { Logger } from "utils/Logger";

export class CreepFactory {


    getCreepCost(bodyParts: BodyPartConstant[]): number {
        throw new Error("Implement me!");
    }

    getCreepCostbyJob(jobType: JobType, spawnLevel: SpawnLevel): number {

        return this.getCreepCost(global.creepCatalog[jobType][spawnLevel].bodyParts);
    }

    public spawnCreepsByJobType(spawnId: Id<StructureSpawn>) {

        const spawn = Game.getObjectById(spawnId);
        if (spawn === undefined)
            return;
        if (spawn === null)
            return;
        const roomName = spawn.room.name;
        let creepTasks = [];
        const tasks = ITaskCatalog.GetImplementations();
        for(let id in tasks){
            var task = new tasks[id]();
            if(task.category === TaskCategory.Creep) creepTasks.push(task);
        }
        const spawnLevel = Governor.getSpawnLevel(roomName);

        let sorted = _.sortBy(creepTasks, task => global.taskCatalog[task.type][spawnLevel].priority);
        for(let id in sorted){
            let task = sorted[id] as CreepTask;
            Logger.LogTrace(`Checking spawns for ${task.type} at ${spawnLevel} in room ${roomName}`);
            var spawnInfo = task.getSpawnInfo(roomName);

            for(let id in spawnInfo){
                const info = spawnInfo[id];
                if(info.spawnCreep) Logger.LogTrace(`New spawn info: ${JSON.stringify(info)}`);
                this.spawnCreep(spawn.id, info);
            }
        }
    }
    private spawnCreep(spawnId: Id<StructureSpawn>, info: SpawnInfo){

        if(!info.spawnCreep) return;

        const creepTemplate = global.creepCatalog[info.jobType][info.spawnLevel];
        const bodyParts = creepTemplate.bodyParts;
        const spawn = Game.getObjectById(spawnId) as StructureSpawn;
        if(spawn.spawning) return;

        const roomName = spawn.room.name
        let creepName = `${roomName}_${info.jobType}${global.util.getUniqueId()}_${info.spawnLevel}`;

        let status = spawn.spawnCreep(bodyParts, creepName, {
            dryRun: true
        });

        status = _.isString(status) ? OK : status;

        if(status !== OK) return status;

        Logger.LogTrace(`Spawning ${creepName} at ${spawn.name}`);
        return spawn.spawnCreep(bodyParts, creepName, {
            memory: {
                acceptedTaskTypes: creepTemplate.taskTypes,
                currentTaskId: "",
                currentTaskStatus: "WAITING",
                jobType: info.jobType
            }
        });
    }

}
