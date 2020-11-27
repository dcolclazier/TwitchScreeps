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



}


