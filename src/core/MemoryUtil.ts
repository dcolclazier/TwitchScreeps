import { CreepTaskType, JobType, SpawnLevel } from "contract/types";

export const MemoryVersion = 2
export class MemoryUtil
{
  public cleanupCreeps() : void {
      for (var name in Memory.creeps) {
          if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
          }
       }
  }
  public getUniqueId() : string{
      return '_' + Math.random().toString(36).substr(2,9);
  }
  public clearMemory() : void {
  }
  public initialize(): void{
    if(Memory.version === undefined || MemoryVersion != Memory.version)
    {
      console.log("Global reset!");
      console.log("Resetting memory...");
      this.initMemory();
    }

  }
  public cleanup(): void{
      this.cleanupCreeps();
  }
  private initMemory() : void{
    console.log("Initializing game...");
    const mem = Memory;
    mem.creeps = {};
    mem.rooms = {};
    mem.spawns = {};
    mem.flags = {};
    mem.test = {};
    mem.tasks = {}

    this.InitRoomsMemory();
    this.InitCreepMemory()
    mem.version = MemoryVersion;
  }

  private getSpawnLevelType(a: number) :SpawnLevel{

    return <SpawnLevel>a;
  }
  private InitCreepMemory() : void{
    for (let name in Game.creeps){

      const type =  JobType[<keyof typeof JobType>name.split("_")[1]];
      // const level = SpawnLevel[<keyof typeof SpawnLevel>name.split("_")[3]]

      const level = <SpawnLevel>(<number>+name.split("_")[3]);
      const creepMemory = <CreepMemory>{
        acceptedTaskTypes: global.creepCatalog[level][type].taskTypes,
        currentTaskId:"",
        currentTaskStatus:"WAITING",
        jobType:type
      }
      Game.creeps[name].memory = creepMemory;
    }
  }
  private InitRoomsMemory() : void{

    for(let name in Game.rooms){
      const room: Room = Game.rooms[name];
      let roomMemory = Memory.rooms[name];
      if(roomMemory === undefined || roomMemory.initialized == false){
        console.log(`Initializing room memory for ${name}`);
        Memory.tasks[name] = {}

        const roomMemory = <RoomMemory>{};
        roomMemory.initialized = true;
        Game.rooms[name].memory = roomMemory;
      }
    }
  }

}


global.taskCatalog = {
  [CreepTaskType.BuildTask]:{
    priority: 3,
  },
  [CreepTaskType.MineTask]:{
    priority: 1,
  },
  [CreepTaskType.RestockTask]:{
    priority: 2,
  },
  [CreepTaskType.UpgradeTask]:{
    priority: 3,
  }
}

global.creepCatalog = {
  [SpawnLevel.Level1]: {
      [JobType.Worker]: {
          bodyParts: [MOVE, CARRY, WORK, WORK],
          taskTypes: [CreepTaskType.BuildTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 0,
              [CreepTaskType.RestockTask]: 0,
              [CreepTaskType.UpgradeTask]: 0
          },
          maxPerRoom: 0
      },
      [JobType.Builder]: {
          bodyParts: [MOVE, CARRY, WORK, WORK],
          taskTypes: [CreepTaskType.BuildTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 1,
              [CreepTaskType.MineTask]: 0,
              [CreepTaskType.RestockTask]: 0,
              [CreepTaskType.UpgradeTask]: 0
          },
          maxPerRoom: 2
      },
      [JobType.Janitor]: {
          bodyParts: [MOVE, CARRY, CARRY],
          taskTypes: [CreepTaskType.RestockTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 0,
              [CreepTaskType.RestockTask]: 1,
              [CreepTaskType.UpgradeTask]: 0
          },
          maxPerRoom: 1
      },
      [JobType.Miner]: {
          bodyParts: [MOVE, WORK, WORK],
          taskTypes: [CreepTaskType.MineTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 2,
              [CreepTaskType.RestockTask]: 0,
              [CreepTaskType.UpgradeTask]: 0
          },
          maxPerRoom: 4
      },
      [JobType.Upgrader]: {
          bodyParts: [MOVE, CARRY, WORK, WORK],
          taskTypes: [CreepTaskType.BuildTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 0,
              [CreepTaskType.RestockTask]: 0,
              [CreepTaskType.UpgradeTask]: 2
          },
          maxPerRoom: 2
      }

  },
  [SpawnLevel.Level2]: {
      [JobType.Worker]: {
          bodyParts: [MOVE, MOVE, CARRY, CARRY, WORK, WORK],
          taskTypes: [CreepTaskType.BuildTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 0,
              [CreepTaskType.RestockTask]: 0,
              [CreepTaskType.UpgradeTask]: 0
          },
          maxPerRoom: 0
      },
      [JobType.Builder]: {
          bodyParts: [MOVE, MOVE, CARRY, CARRY, WORK, WORK],
          taskTypes: [CreepTaskType.BuildTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 0,
              [CreepTaskType.RestockTask]: 0,
              [CreepTaskType.UpgradeTask]: 0
          },
          maxPerRoom:3
      },
      [JobType.Janitor]: {
          bodyParts: [MOVE, MOVE, CARRY, CARRY, CARRY, WORK],
          taskTypes: [CreepTaskType.RestockTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 0,
              [CreepTaskType.RestockTask]: 1,
              [CreepTaskType.UpgradeTask]: 0
          },
          maxPerRoom:3
      },
      [JobType.Miner]: {
          bodyParts: [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
          taskTypes: [CreepTaskType.MineTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 2,
              [CreepTaskType.RestockTask]: 0,
              [CreepTaskType.UpgradeTask]: 0
          },
          maxPerRoom:4
      },
      [JobType.Upgrader]: {
          bodyParts: [MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],
          taskTypes: [CreepTaskType.UpgradeTask],
          creepsPerTask: {
              [CreepTaskType.BuildTask]: 0,
              [CreepTaskType.MineTask]: 0,
              [CreepTaskType.RestockTask]: 0,
              [CreepTaskType.UpgradeTask]: 3
          },
          maxPerRoom:3
      }
  }
}
