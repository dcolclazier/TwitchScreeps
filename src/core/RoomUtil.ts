export class RoomUtil {

    public fillup(creepName: string, resourceType: ResourceConstant, cleanup: boolean = false) : boolean{

        if(cleanup){
          if(this.collectFromDroppedResource(creepName, resourceType)) return true;
          //if(this.collectFromRuin(creepName, resourceType)) return;
          //if(this.collectFromTombstone(creepName, resourceType)) return;
        }
        else{
          if(this.collectFromDroppedResource(creepName, resourceType)) return true;
          //if(this.collectFromRuin(creepName, resourceType)) return;
          //if(this.collectFromTombstone(creepName, resourceType)) return;
          //if(this.collectFromStorage(creepName, resourceType)) return;
        }
        return false;

    }

    private collectFromDroppedResource(creepName: string, resourceType: ResourceConstant): boolean {

        const creep = Game.creeps[creepName];
        if (creep === undefined || creep === null) return false;

        const resourcePiles = _.sortBy(this.getResourcePiles(creep.room.name, resourceType), s => s.amount / creep.pos.getRangeTo(s.pos)).reverse();
        var closest = _.first(resourcePiles);

        var result = creep.pickup(closest)
        if (result === ERR_NOT_IN_RANGE) {
          creep.moveTo(closest);
        }
        return true;


    }

    public getResourcePiles(roomName: string, resourceType: ResourceConstant): Resource<ResourceConstant>[]{
        const resourcePiles =Game.rooms[roomName].find(FIND_DROPPED_RESOURCES)
            .filter(resource => resource != (undefined || null)
                    && resource.amount > 100
                    && resource.resourceType === resourceType);
        return resourcePiles;
    }

    public getRestockables(roomName: string) : AnyOwnedStructure[]{

      const room = Game.rooms[roomName];
      if(room === null || room === undefined) return [];
      if(room.controller?.owner?.username !== global.owner) return [];

      return room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            if(structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_EXTENSION){
                    const capacity = structure.store.getCapacity(RESOURCE_ENERGY);
                    if(capacity !== null){
                        return structure.store.energy < capacity;
                    }
                }
            return false;
        }
    });
    }
}
