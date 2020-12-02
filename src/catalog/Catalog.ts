import { CreepTaskType, JobType, SpawnLevel, StructureTaskType } from "core/types";
import { BuildTask } from "tasks/creep/BuildTask";
import { FillStorageTask } from "tasks/creep/FillStorageTask";
import { FillTowersTask } from "tasks/creep/FillTowersTask";
import { DefendRoomTowerTask } from "tasks/structure/DefendRoomTowerTask";
import { MineTask } from "tasks/creep/MineTask";
import { RestockTask } from "tasks/creep/RestockTask";
import { UpgradeTask } from "tasks/creep/UpgradeTask";
import { LinkMemoryHandler } from "memory/structure/LinkMemory";
import { UpgradeRampartsTask } from "tasks/structure/UpgradeRamparts";
import { TowerMemoryHandler } from "memory/structure/TowerMemory";
import { SourceMemoryHandler } from "memory/room/SourceMemory";

export class MemoryCatalogInit{
  static init() : void{
      TowerMemoryHandler.name
      LinkMemoryHandler.name
      SourceMemoryHandler.name
      //Only way I could figure out how to call the class decorators to add these to the ITaskCatalog... ugh.
  }
}

export class TaskCatalogInit{
  static init() : void{
        BuildTask.name;
        RestockTask.name;
        MineTask.name;
        UpgradeTask.name;
        FillTowersTask.name
        DefendRoomTowerTask.name
        FillStorageTask.name
        UpgradeRampartsTask.name
        //Only way I could figure out how to call the class decorators to add these to the ITaskCatalog... ugh.
  }
}

  global.creepTaskCatalog = {
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
          [JobType.Miner]:1,
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
          [JobType.Upgrader]:4,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Upgrader]
      }
    },
    [CreepTaskType.FillTowersTask]:{
      [SpawnLevel.Level1]:{
        priority: 4,
        creepsPerTask: {
          [JobType.Janitor]:1,
          [JobType.Miner]:0,
          [JobType.Upgrader]:0,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Janitor]
      },
      [SpawnLevel.Level2]:{
        priority: 1,
        creepsPerTask: {
          [JobType.Janitor]:1,
          [JobType.Miner]:0,
          [JobType.Upgrader]:0,
          [JobType.Worker]:1,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Janitor, JobType.Worker]
      }
    },
    [CreepTaskType.FillStorageTask]:{
      [SpawnLevel.Level1]:{
        priority: 4,
        creepsPerTask: {
          [JobType.Janitor]:1,
          [JobType.Miner]:0,
          [JobType.Upgrader]:0,
          [JobType.Worker]:0,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Janitor]
      },
      [SpawnLevel.Level2]:{
        priority: 4,
        creepsPerTask: {
          [JobType.Janitor]:2,
          [JobType.Miner]:0,
          [JobType.Upgrader]:0,
          [JobType.Worker]:1,
          [JobType.Builder]:0
        },
        acceptedJobTypes: [JobType.Janitor, JobType.Worker]
      }
    }
  }

  global.creepCatalog = {
    [JobType.Worker]:
    {
      [SpawnLevel.Level1]: {
        bodyParts: [MOVE, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask, CreepTaskType.FillStorageTask],
        maxPerRoom: 0
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, CARRY, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask, CreepTaskType.RestockTask, CreepTaskType.FillTowersTask, CreepTaskType.FillStorageTask],
        maxPerRoom: 0
      }
    },
    [JobType.Janitor]:{
      [SpawnLevel.Level1]: {
        bodyParts: [MOVE, MOVE, CARRY, CARRY],
        taskTypes: [CreepTaskType.RestockTask, CreepTaskType.FillStorageTask, CreepTaskType.FillTowersTask],
        maxPerRoom: 1
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
        taskTypes: [CreepTaskType.RestockTask, CreepTaskType.FillTowersTask, CreepTaskType.FillStorageTask],
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
        maxPerRoom:4
      }
    },
    [JobType.Builder]: {
      [SpawnLevel.Level1]: {
        bodyParts: [MOVE, CARRY, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask],
        maxPerRoom: 2
      },
      [SpawnLevel.Level2]: {
        bodyParts: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
        taskTypes: [CreepTaskType.BuildTask],
        maxPerRoom:2
      }
    }
  }

  global.structureTaskCatalog = {
    [StructureTaskType.DefendRoomTask]: {
      [SpawnLevel.Level1]:{
        maxStructuresPerTask:6,
        priority: 1
      },
      [SpawnLevel.Level2]:{
        maxStructuresPerTask:6,
        priority: 1
      }
    },
    [StructureTaskType.TransferEnergyLinkTask]: {
      [SpawnLevel.Level1]:{
        maxStructuresPerTask:6,
        priority: 8
      },
      [SpawnLevel.Level2]:{
        maxStructuresPerTask:6,
        priority: 8
      }
    },
    [StructureTaskType.UpgradeRamparts]: {
      [SpawnLevel.Level1]:{
        maxStructuresPerTask:6,
        priority: 3
      },
      [SpawnLevel.Level2]:{
        maxStructuresPerTask:6,
        priority: 3
      }
    }
  }
