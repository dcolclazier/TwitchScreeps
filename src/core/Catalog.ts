import { CreepTaskType, JobType, SpawnLevel } from "contract/types";
import { BuildTask } from "tasks/creep/BuildTask";
import { MineTask } from "tasks/creep/MineTask";
import { RestockTask } from "tasks/creep/RestockTask";
import { UpgradeTask } from "tasks/creep/UpgradeTask";



export class TaskInit{
    static init() : void{
        BuildTask.name;
        RestockTask.name;
        MineTask.name;
        UpgradeTask.name;

        //Only way I could figure out how to call the class decorators to add these to the ITaskCatalog... ugh.
    }
  }

  global.taskCatalog = {
    [CreepTaskType.BuildTask]:{
      priority: 3,
      creepsPerTask: 1
    },
    [CreepTaskType.MineTask]:{
      priority: 1,
      creepsPerTask: 2
    },
    [CreepTaskType.RestockTask]:{
      priority: 2,
      creepsPerTask: 2
    },
    [CreepTaskType.UpgradeTask]:{
      priority: 3,
      creepsPerTask: 3
    }
  }

  global.creepCatalog = {
    [JobType.Worker]:
    {
      [SpawnLevel.Level1]: {
        bodyParts: [MOVE, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask],
        maxPerRoom: 0
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, CARRY, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask],
        maxPerRoom: 0
      }
    },
    [JobType.Janitor]:{
      [SpawnLevel.Level1]: {
        bodyParts: [MOVE, CARRY, CARRY],
        taskTypes: [CreepTaskType.RestockTask],
        maxPerRoom: 1
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, CARRY, CARRY, CARRY, WORK],
        taskTypes: [CreepTaskType.RestockTask],
        maxPerRoom:3
      }
    },
    [JobType.Miner]:{
      [SpawnLevel.Level1]: {
        bodyParts: [MOVE, WORK, WORK],
        taskTypes: [CreepTaskType.MineTask],
        maxPerRoom: 4
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
        taskTypes: [CreepTaskType.MineTask],
        maxPerRoom:4
      }
    },
    [JobType.Upgrader]: {
      [SpawnLevel.Level1]: {
        bodyParts: [MOVE, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask],
        maxPerRoom: 2
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],
        taskTypes: [CreepTaskType.UpgradeTask],
        maxPerRoom:3
      }
    },
    [JobType.Builder]: {
      [SpawnLevel.Level1]: {
        bodyParts: [MOVE, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask],
        maxPerRoom: 2
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, CARRY, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask],
        maxPerRoom:3
      }
    }
  }
