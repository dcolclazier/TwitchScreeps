import { Console } from "console";
import { JobType, SpawnLevel } from "contract/types";
import { Logger } from "utils/Logger";
import { CreepFactory } from "./CreepFactory";

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

        Logger.LogTrace(`No spawn level higher than ${SpawnLevel.Level2} foound`)

        this.currentSpawnLevel = SpawnLevel.Level2
        Logger.LogTrace(`Spawn level set to ${SpawnLevel[this.currentSpawnLevel]}`);
        return this.currentSpawnLevel;
    }

}


