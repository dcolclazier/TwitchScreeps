import { JobType, SpawnLevel } from "contract/types";
import { CreepFactory } from "./CreepFactory";

export class Governor
{
    roomName: string;
    creepFactory : CreepFactory = new CreepFactory();
    constructor(roomName: string){
        this.roomName = roomName;
    }

    public govern(){

        var room = Game.rooms[this.roomName];
        if(room.controller == (undefined || null)) return;
        if(room.controller.owner?.username != global.owner) return;


        const spawn = this.getBestSpawn();
        if(spawn === undefined) return;

        this.creepFactory.spawnCreepsByJobType(spawn.id);
        global.taskManager.runTasks(this.roomName);

    }
    getBestSpawn() : StructureSpawn | undefined{
        const spawns = Game.rooms[this.roomName].find(FIND_MY_SPAWNS)
        return spawns[0] ?? undefined;
    }

    public static getSpawnLevel(roomName: string) : SpawnLevel{

        var janitors = _.filter(Game.creeps, c=> c.room.name === roomName && c.memory?.jobType === JobType.Janitor);
        var miners = _.filter(Game.creeps, c=> c.room.name === roomName && c.memory?.jobType === JobType.Miner);

        var minerWorkParts = _.sum(miners, miner=> miner.getActiveBodyparts(WORK));

        if(janitors.length === 0 || minerWorkParts < 1) return SpawnLevel.Level1;

        var totalEnergy = Game.rooms[roomName].energyCapacityAvailable;
        if(totalEnergy <= 300) return SpawnLevel.Level1;
        else if(totalEnergy <= 600) return SpawnLevel.Level2;

        //console.log("ERROR. Implement more spawn levels!");
        return SpawnLevel.Level2;
    }

}


