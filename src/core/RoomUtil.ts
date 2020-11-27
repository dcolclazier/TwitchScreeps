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
        if (creep === undefined) return false;

        var resourcePiles = creep.room.find(FIND_DROPPED_RESOURCES)
          .filter(resource => resource != (undefined || null)
                    && resource.amount > 100
                    && resource.resourceType === resourceType);
        if (resourcePiles.length == 0) return false;

        const sortedByRange = _.sortBy(resourcePiles, s => s.amount / creep.pos.getRangeTo(s.pos)).reverse();
        var closest = _.first(sortedByRange);

        var result = creep.pickup(closest)
        if (result == ERR_NOT_IN_RANGE) {
          creep.moveTo(closest);
        }
        return true;


    }

    public getRestockables(roomName: string) : AnyOwnedStructure[]{

      const room = Game.rooms[roomName]
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
