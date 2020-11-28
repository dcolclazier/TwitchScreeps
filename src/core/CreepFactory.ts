import { JobType, CreepTaskType, SpawnLevel, TaskCategory } from "contract/types";
import { BuildTask } from "tasks/creep/BuildTask";
import { RestockTask } from "tasks/creep/RestockTask";
import { MineTask } from "tasks/creep/MineTask";
import { UpgradeTask } from "tasks/creep/UpgradeTask";
import { ITaskCatalog } from "contract/ITaskCatalog";
import { CreepTask } from "tasks/base/CreepTask";



//when we spawn...


export class CreepFactory {


    getCreepCost(bodyParts: BodyPartConstant[]): number {
        throw new Error("Implement me!");
    }

    getCreepCostbyJob(jobType: JobType, spawnLevel: SpawnLevel): number {

        return this.getCreepCost(global.creepCatalog[spawnLevel][jobType].bodyParts);
    }

    public spawnCreepsByJobType(spawnId: Id<StructureSpawn>) {
        const spawn = Game.getObjectById(spawnId);
        if (spawn === undefined)
            return;
        if (spawn === null)
            return;

        let janitorSpawn = RestockTask.getSpawnInfo(spawn.room.name);
        if (janitorSpawn.spawnCreep)
            this.spawnCreep(spawn.id, janitorSpawn.jobType, janitorSpawn.spawnLevel);

        let minerSpawn = MineTask.getSpawnInfo(spawn.room.name);
        if (minerSpawn.spawnCreep)
            this.spawnCreep(spawn.id, minerSpawn.jobType, minerSpawn.spawnLevel);

        let buildSpawn = BuildTask.getSpawnInfo(spawn.room.name);
        if (buildSpawn.spawnCreep)
            this.spawnCreep(spawn.id, buildSpawn.jobType, buildSpawn.spawnLevel);

        let upgradeSpawn = UpgradeTask.getSpawnInfo(spawn.room.name);
        if (upgradeSpawn.spawnCreep)
            this.spawnCreep(spawn.id, upgradeSpawn.jobType, upgradeSpawn.spawnLevel);

        let creepTasks = [];
        const tasks = ITaskCatalog.GetImplementations();
        for(let id in tasks){
            var task = new tasks[id]();
            if(task.category === TaskCategory.Creep) creepTasks.push(task);
        }
        let sorted = _.sortBy(creepTasks, l => global.taskCatalog[l.type].priority);
        for(let id in sorted){
            let task = sorted[id] as CreepTask;
            console.log("yes? " + JSON.stringify(task.getSpawnInfo(spawn.room.name)));
            //this.spawnCreep2(spawn.id, task.getSpawnInfo(spawn.room.name));
        }
    }
    private spawnCreep2(spawnId: Id<StructureSpawn>, info: SpawnInfo){

        if(!info.spawnCreep) return;

        const creepTemplate = global.creepCatalog[info.spawnLevel][info.jobType];
        const bodyParts = creepTemplate.bodyParts;
        const taskTypes = creepTemplate.taskTypes;
        const spawn = Game.getObjectById(spawnId) as StructureSpawn;
        let creepName = `${spawn.room.name}_${info.jobType}${global.util.memory.getUniqueId()}_${info.spawnLevel}`;

        let status: number | string = spawn.spawnCreep(bodyParts, creepName, {
            dryRun: true
        });

        status = _.isString(status) ? OK : status;
        while (status === -3) {
            console.log("OMG OMG OMG YOURE UNIQUE ALGORITHM SUCKS!!!!!!!!!");
            creepName = `${spawn.room.name}_${info.jobType}${global.util.memory.getUniqueId()}_${info.spawnLevel}`;
            status = spawn.spawnCreep(bodyParts, creepName, {
                dryRun: true
            });
            status = _.isString(status) ? OK : status;
        }
        if (status === OK && spawn.spawning !== (null || undefined)) {
            const mem: CreepMemory = {
                acceptedTaskTypes: taskTypes,
                currentTaskId: "",
                currentTaskStatus: "WAITING",
                jobType: info.jobType
            };
            status = spawn.spawnCreep(bodyParts, creepName, {
                memory: mem
            });
            return _.isString(status) ? OK : status;
        }
        else {
            return status;
        }
    }

    private spawnCreep(spawnId: Id<StructureSpawn>, jobType: JobType, spawnLevel: SpawnLevel): number {

        const creepTemplate = global.creepCatalog[spawnLevel][jobType];
        const bodyParts = creepTemplate.bodyParts;
        const taskTypes = creepTemplate.taskTypes;
        const spawn = Game.getObjectById(spawnId) as StructureSpawn;
        let creepName = `${spawn.room.name}_${jobType}${global.util.memory.getUniqueId()}_${spawnLevel}`;

        let status: number | string = spawn.spawnCreep(bodyParts, creepName, {
            dryRun: true
        });

        status = _.isString(status) ? OK : status;
        while (status === -3) {
            console.log("OMG OMG OMG YOURE UNIQUE ALGORITHM SUCKS!!!!!!!!!");
            creepName = `${spawn.room.name}_${jobType}${global.util.memory.getUniqueId()}_${spawnLevel}`;
            status = spawn.spawnCreep(bodyParts, creepName, {
                dryRun: true
            });
            status = _.isString(status) ? OK : status;
        }
        if (status === OK && spawn.spawning !== (null || undefined)) {
            const mem: CreepMemory = {
                acceptedTaskTypes: taskTypes,
                currentTaskId: "",
                currentTaskStatus: "WAITING",
                jobType: jobType
            };
            status = spawn.spawnCreep(bodyParts, creepName, {
                memory: mem
            });
            return _.isString(status) ? OK : status;
        }
        else {
            return status;
        }


    }

}
