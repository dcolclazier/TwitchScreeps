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
      [SpawnLevel.Level1]:{
        priority: 3,
        creepsPerTask: {
          [JobType.Janitor]:0,
          [JobType.Miner]:0,
          [JobType.Upgrader]:0,
          [JobType.Worker]:0,
          [JobType.Builder]:1
        },
        acceptedJobTypes: [JobType.Builder]
      },
      [SpawnLevel.Level2]:{
        priority: 3,
        creepsPerTask: {
          [JobType.Janitor]:0,
          [JobType.Miner]:0,
          [JobType.Upgrader]:0,
          [JobType.Worker]:1,
          [JobType.Builder]:1
        },
        acceptedJobTypes: [JobType.Builder, JobType.Worker]
      }
    },
    [CreepTaskType.MineTask]:{
      [SpawnLevel.Level1]:{
        priority: 1,
        creepsPerTask: {
          [JobType.Janitor]:0,
          [JobType.Miner]:2,
          [JobType.Upgrader]:0,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Miner]
      },
      [SpawnLevel.Level2]:{
        priority: 1,
        creepsPerTask: {
          [JobType.Janitor]:0,
          [JobType.Miner]:2,
          [JobType.Upgrader]:0,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Miner]
      }
    },
    [CreepTaskType.RestockTask]:{
      [SpawnLevel.Level1]:{
        priority: 2,
        creepsPerTask: {
          [JobType.Janitor]:2,
          [JobType.Miner]:0,
          [JobType.Upgrader]:0,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Janitor]
      },
      [SpawnLevel.Level2]:{
        priority: 2,
        creepsPerTask: {
          [JobType.Janitor]:2,
          [JobType.Miner]:0,
          [JobType.Upgrader]:0,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Janitor, JobType.Worker]
      }
    },
    [CreepTaskType.UpgradeTask]:{
      [SpawnLevel.Level1]:{
        priority: 3,
        creepsPerTask: {
          [JobType.Janitor]:0,
          [JobType.Miner]:0,
          [JobType.Upgrader]:1,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Upgrader]
      },
      [SpawnLevel.Level2]:{
        priority: 3,
        creepsPerTask: {
          [JobType.Janitor]:0,
          [JobType.Miner]:0,
          [JobType.Upgrader]:3,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Upgrader]
      }
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
        bodyParts: [MOVE, MOVE, CARRY, CARRY],
        taskTypes: [CreepTaskType.RestockTask],
        maxPerRoom: 1
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK],
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
        bodyParts: [MOVE, MOVE, CARRY, WORK],
        taskTypes: [CreepTaskType.UpgradeTask],
        maxPerRoom: 2
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK],
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
        bodyParts: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask],
        maxPerRoom:3
      }
    }
  }
