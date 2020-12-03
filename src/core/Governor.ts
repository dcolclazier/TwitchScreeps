import { JobType, SpawnLevel } from "core/types";
import { Logger } from "utils/Logger";
import { CreepFactory } from "./CreepFactory";

interface IEventHandler{
    eventType: number
    onEvent(event: EventItem): void
}

export namespace EventHandlerFactory{

    const handlers: { [eventType: number] : Constructor<IEventHandler>; } = {};

    export function getHandlers(): Constructor<IEventHandler>[] {
        return _.map(handlers, h => h);
    }
    export function getHandler(eventType: number) : Constructor<IEventHandler> | undefined{
        return handlers[eventType];
    }
    export function register<T extends Constructor<IEventHandler>>(ctor: T) {
        var m = new ctor();
        handlers[m.eventType] = ctor;
        return ctor;
    }
}

@EventHandlerFactory.register
export class AttackEventHandler implements IEventHandler{
    eventType: number = EVENT_ATTACK;
    onEvent(event: EventItem): void {
        Logger.LogWarning(`ATTACK EVENT: ` + JSON.stringify(event));
    }
}

@EventHandlerFactory.register
export class ObjectDestroyedEventHandler implements IEventHandler{
    eventType: number = EVENT_OBJECT_DESTROYED;
    onEvent(event: EventItem): void {
        Logger.LogWarning(`Object destroyed: ` + JSON.stringify(event));
    }
}


export class EventHandlerTest{

    static eventMap: {[eventType:number] : string} = {
        [1]:"Attack",
        [2]:"Object Destroyed",
        [3]:"Attack Controller",
        [4]:"Build",
        [5]:"Harvest",
        [6]:"Heal",
        [7]:"Repair",
        [8]:"Reserve Controller",
        [9]:"Upgrade Controller",
        [10]:"Exit",
        [11]:"Power",
        [12]:"Transfer"
    }

    public static HandleEvents(roomName: string) : void {

      var events = Game.rooms[roomName].getEventLog();
      const eventGroups = _.groupBy(events, e => e.event);
      for(let type in eventGroups){

          for(let event of eventGroups[type]){
              Logger.LogTrace(`EVENT ${this.eventMap[+type]} ${JSON.stringify(event.data)}`);
          }
          var ctor = EventHandlerFactory.getHandler(+type);
          if(ctor === undefined){
              continue;
          }
          var handler = new ctor();
          _.forEach(eventGroups[type], e => handler.onEvent(e));
      }
    }
  }
export class Governor
{
    roomName: string;
    creepFactory : CreepFactory = new CreepFactory();

    static lastTick: number = 0;
    static currentSpawnLevel: SpawnLevel = SpawnLevel.Level1

    constructor(roomName: string){
        this.roomName = roomName;
    }

    public govern(){

        var room = Game.rooms[this.roomName];
        if(room?.controller === undefined || room.controller === null) return;
        if(room.controller.owner?.username != global.owner) return;
        Logger.LogTrace("Governor: room validated");

        const spawn = this.getBestSpawn();
        if(spawn === undefined) {
            Logger.LogTrace(`Room ${this.roomName} skipped by governor - no spawn found.`)
            return;
        }

        this.creepFactory.spawnCreepsByJobType(spawn.id);
        global.taskManager.runTasks(this.roomName);

    }

    //todo - needs work...
    public getBestSpawn() : StructureSpawn | undefined{
        const spawns = Game.rooms[this.roomName].find(FIND_MY_SPAWNS)
        Logger.LogTrace(`getBestSpawn(): ${JSON.stringify(spawns)}`);
        return spawns[0] ?? undefined;
    }

    public static getSpawnLevel(roomName: string) : SpawnLevel{

        if(this.lastTick == Game.time) return this.currentSpawnLevel;
        this.lastTick = Game.time;

        var janitors = _.filter(Game.creeps, c=> c.room.name === roomName && c.memory?.jobType === JobType.Janitor);
        if(janitors.length == 0) {

            this.currentSpawnLevel = SpawnLevel.Level1;
            Logger.LogWarning(`No janitors: spawn level set to ${SpawnLevel[this.currentSpawnLevel]}`);
            return this.currentSpawnLevel
        }
        var miners = _.filter(Game.creeps, c=> c.room.name === roomName && c.memory?.jobType === JobType.Miner);
        if(miners.length ==0) {

            this.currentSpawnLevel = SpawnLevel.Level1;
            Logger.LogWarning(`No miners: spawn level set to ${SpawnLevel[this.currentSpawnLevel]}`);
            return this.currentSpawnLevel
        }

        var totalEnergy = Game.rooms[roomName].energyCapacityAvailable;
        if(totalEnergy <= 300)  {
            this.currentSpawnLevel = SpawnLevel.Level1;
            Logger.LogTrace(`Spawn level set to ${SpawnLevel[this.currentSpawnLevel]}`);
            return this.currentSpawnLevel
        }
        else if(totalEnergy <= 600)  {
            this.currentSpawnLevel = SpawnLevel.Level2;
            Logger.LogTrace(`Spawn level set to ${SpawnLevel[this.currentSpawnLevel]}`);
            return this.currentSpawnLevel
        }
        else if(totalEnergy <= 1200)  {
            this.currentSpawnLevel = SpawnLevel.Level3;
            Logger.LogTrace(`Spawn level set to ${SpawnLevel[this.currentSpawnLevel]}`);
            return this.currentSpawnLevel
        }

        Logger.LogTrace(`No spawn level higher than ${SpawnLevel.Level3} foound`)

        this.currentSpawnLevel = SpawnLevel.Level3
        Logger.LogTrace(`Spawn level set to ${SpawnLevel[this.currentSpawnLevel]}`);
        return this.currentSpawnLevel;
    }

}


