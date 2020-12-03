import { MemoryHandlerFactory } from "core/MemoryHandlerFactory";
import { JobType, SpawnLevel } from "core/types";
import { Logger } from "utils/Logger";
import { MemoryCatalogInit, TaskCatalogInit } from "../core/Catalog";


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

    TaskCatalogInit.init();
    MemoryCatalogInit.init();
    if(Memory.version === undefined || global.memoryVersion != Memory.version)
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
    // mem.tasks = {};
    mem.structures = {};
    mem.tasks = {};


    this.InitRoomsMemory();
    this.InitCreepMemory()
    mem.version = global.memoryVersion;

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

    for(let roomName in Game.rooms){
      let roomMemory = Memory.rooms[roomName];
      if(roomMemory != undefined && roomMemory.initialized == true) continue;


      Logger.LogInformation(`Clearing task list for ${roomName} `);
      Memory.tasks[roomName] = {};
      Memory.structures[roomName] = {}


      Logger.LogInformation(`Initializing room memory for ${roomName}`);

      Game.rooms[roomName].memory = {
        initialized:true,
        sources:[]
        // links: {}
      };

      const sources = Game.rooms[roomName].find(FIND_SOURCES);
      var ctor = MemoryHandlerFactory.getHandler("source");
      if(ctor == undefined){
        Logger.LogWarning(`No memory handler found for sources!`);
        return;
      }
      var handler = new ctor();
      for(let source of sources){
        handler.registerMemory(source.room.name, source.id);
      }

      //group structures by type
      const structuresByType : StructuresByType = {};
      const structures = Game.rooms[roomName].find(FIND_MY_STRUCTURES);
      for(let structure of structures){
        if(structuresByType[structure.structureType] == undefined){
          structuresByType[structure.structureType] = [];
        }
      }
      for(let structureType in structuresByType){
          this.InitalizeStructureMemoryByType(roomName, structureType as StructureConstant);
      }


    }
  }

  private InitalizeStructureMemoryByType(roomName: string, structureType: StructureConstant){

    Logger.LogDebug(`Initializing memory for ${structureType}s`);

    var ctor = MemoryHandlerFactory.getHandler(structureType);
    if(ctor === undefined){
      Logger.LogWarning(`No memory handler found for ${structureType}`);
      return;
    }
    var handler = new ctor();

    const structures = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === structureType
    });
    Logger.LogDebug(`Found ${structures.length} ${structureType}(s)`);
    if(structures.length == 0) return;

    Memory.structures[roomName][handler.memoryObjectType] = {};
    for(let structure of structures){
      handler.registerMemory(roomName, structure.id);
    }
  }


}

