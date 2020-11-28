import { JobType, SpawnLevel } from "contract/types";
import { TaskInit } from "./Catalog";

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

