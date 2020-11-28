import { JobType, SpawnLevel } from "contract/types";
import { Logger } from "utils/Logger";
import { TaskInit } from "./Catalog";

export const MemoryVersion = 1
export class MemoryUtil
{
  public cleanupCreeps() : void {
      for (var name in Memory.creeps) {
          if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
          }
       }
  }

  public clearMemory() : void {
  }
  public initialize(): void{
    TaskInit.init();
    if(Memory.version === undefined || MemoryVersion != Memory.version)
    {
      Logger.LogWarning("Global reset!");
      Logger.LogInformation("Resetting memory...");
      this.initMemory();
    }

  }
  public cleanup(): void{
      this.cleanupCreeps();
  }
  private initMemory() : void{
    Logger.LogInformation("Initializing memory...");
    const mem = Memory;
    mem.creeps = {};
    mem.rooms = {};
    mem.spawns = {};
    mem.flags = {};
    mem.test = {};
    mem.tasks = {}
    mem.tasksNew = {}


    this.InitRoomsMemory();
    this.InitCreepMemory()
    mem.version = MemoryVersion;

  }

  private InitCreepMemory() : void{

    for (let name in Game.creeps){

      const type =  JobType[<keyof typeof JobType>name.split("_")[1]];
      const spawnLevel = <SpawnLevel>(<number>+name.split("_")[3]);
      const memory = <CreepMemory>{
        acceptedTaskTypes: global.creepCatalog[type][spawnLevel].taskTypes,
        currentTaskId:"",
        currentTaskStatus:"WAITING",
        jobType:type
      }
      Logger.LogInformation(`Initializing creep memory for ${name}: ${JSON.stringify(memory)}`);
      Game.creeps[name].memory = memory;

    }
  }
  private InitRoomsMemory() : void{

    for(let name in Game.rooms){
      let roomMemory = Memory.rooms[name];
      if(roomMemory === undefined || roomMemory.initialized == false){

        Logger.LogInformation(`Clearing task list for ${name} `);
        Memory.tasks[name] = {}

        const memory = <RoomMemory>{
          initialized:true,
        };

        Logger.LogInformation(`Initializing room memory for ${name}: ${JSON.stringify(memory)}`);
        Game.rooms[name].memory = memory;
      }
    }
  }

}

