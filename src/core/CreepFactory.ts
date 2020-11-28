import { JobType, SpawnLevel, TaskCategory } from "contract/types";
import { ITaskCatalog } from "contract/ITaskCatalog";
import { CreepTask } from "tasks/base/CreepTask";

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

        let creepTasks = [];
        const tasks = ITaskCatalog.GetImplementations();
        for(let id in tasks){
            var task = new tasks[id]();
            if(task.category === TaskCategory.Creep) creepTasks.push(task);
        }
        let sorted = _.sortBy(creepTasks, l => global.taskCatalog[l.type].priority);
        for(let id in sorted){
            let task = sorted[id] as CreepTask;
            // console.log("yes? " + JSON.stringify(task.getSpawnInfo(spawn.room.name)));
            this.spawnCreep(spawn.id, task.getSpawnInfo(spawn.room.name));
        }
    }
    private spawnCreep(spawnId: Id<StructureSpawn>, info: SpawnInfo){

        if(!info.spawnCreep) return;

        const creepTemplate = global.creepCatalog[info.jobType][info.spawnLevel];
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

    // private spawnCreep(spawnId: Id<StructureSpawn>, jobType: JobType, spawnLevel: SpawnLevel): number {

    //     const creepTemplate = global.creepCatalog[spawnLevel][jobType];
    //     const bodyParts = creepTemplate.bodyParts;
    //     const taskTypes = creepTemplate.taskTypes;
    //     const spawn = Game.getObjectById(spawnId) as StructureSpawn;
    //     let creepName = `${spawn.room.name}_${jobType}${global.util.memory.getUniqueId()}_${spawnLevel}`;

    //     let status: number | string = spawn.spawnCreep(bodyParts, creepName, {
    //         dryRun: true
    //     });

    //     status = _.isString(status) ? OK : status;
    //     while (status === -3) {
    //         console.log("OMG OMG OMG YOURE UNIQUE ALGORITHM SUCKS!!!!!!!!!");
    //         creepName = `${spawn.room.name}_${jobType}${global.util.memory.getUniqueId()}_${spawnLevel}`;
    //         status = spawn.spawnCreep(bodyParts, creepName, {
    //             dryRun: true
    //         });
    //         status = _.isString(status) ? OK : status;
    //     }
    //     if (status === OK && spawn.spawning !== (null || undefined)) {
    //         const mem: CreepMemory = {
    //             acceptedTaskTypes: taskTypes,
    //             currentTaskId: "",
    //             currentTaskStatus: "WAITING",
    //             jobType: jobType
    //         };
    //         status = spawn.spawnCreep(bodyParts, creepName, {
    //             memory: mem
    //         });
    //         return _.isString(status) ? OK : status;
    //     }
    //     else {
    //         return status;
    //     }


    // }

}
