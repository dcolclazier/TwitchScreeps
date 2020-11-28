import { CreepTaskType, JobType, SpawnLevel } from "contract/types";
import { BuildTask } from "tasks/creep/BuildTask";
import { MineTask } from "tasks/creep/MineTask";
import { RestockTask } from "tasks/creep/RestockTask";
import { UpgradeTask } from "tasks/creep/UpgradeTask";

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
    TaskInit.init();
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
        acceptedTaskTypes: global.creepCatalog[type][level].taskTypes,
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
    creepsPerTask: 1
  },
  [CreepTaskType.RestockTask]:{
    priority: 2,
    creepsPerTask: 1
  },
  [CreepTaskType.UpgradeTask]:{
    priority: 3,
    creepsPerTask: 1
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
