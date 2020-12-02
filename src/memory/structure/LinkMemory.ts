import TaskType, { LinkType, StructureTaskType } from "../../core/types";
import { MemoryHandlerFactory } from "core/MemoryHandlerFactory";
import { Logger } from "utils/Logger";
import { StructureMemory } from "memory/StructureMemory";
import { StructureMemoryHandler } from "memory/MemoryHandler";


export class LinkMemory extends StructureMemory<StructureLink> {
    acceptedTaskTypes: TaskType[] = [StructureTaskType.TransferEnergyLinkTask];
    structureType: StructureConstant = "link";
    linkType: LinkType
    shouldSend: boolean

    constructor(id: Id<StructureLink>, linkType: LinkType){
        super(id);
        this.linkType = linkType;
        this.shouldSend = linkType != LinkType.Storage;
    }
}
@MemoryHandlerFactory.register
export class LinkMemoryHandler implements StructureMemoryHandler {
    memoryObjectType: StructureConstant = STRUCTURE_LINK;
    // structureType: StructureConstant = "link";

    public registerMemory(roomName: string, id: string): void {

        const linkId = id as Id<StructureLink>
        const memory = new LinkMemory(linkId, this.getLinkType(linkId));
        Logger.LogDebug(`Registering memory for link ${id}`);
        Memory.structures[roomName][this.memoryObjectType][id] = memory;
    }
    private getLinkType(linkId: Id<StructureLink>): LinkType {

        const link = Game.getObjectById(linkId);
        if (link === undefined || link === null)
            throw new Error(`Link was undefined: ${linkId}`);

        const storage = Game.rooms[link.room.name].storage;
        if (storage != undefined && link.pos.getRangeTo(storage) <= 2) {
            Logger.LogDebug("Passed storage test");
            return LinkType.Storage;
        }
        else {
            Logger.LogDebug("Failed storage test " + link.pos.getRangeTo(storage!));

        }

        if (link.pos.x <= 2 || link.pos.x >= 47 || link.pos.y <= 2 || link.pos.y >= 47) {
            Logger.LogDebug("Passed edge test");
            return LinkType.Edge;
        }
        else {
            Logger.LogDebug("Failed edge test");
        }

        const sources = _.map(Game.rooms[link.room.name].memory.sources, s => Game.getObjectById(s.id) as Source)
        for (let source of sources) {
            if (link.pos.getRangeTo(source) <= 2) {
                Logger.LogDebug("Passed source test");
                return LinkType.Harvest;

            }
            else {
                Logger.LogDebug("Failed source test" + link.pos.getRangeTo(source));
            }
        }

        throw new Error(`Link type could not be determined: ${link.id}, ${JSON.stringify(link.pos)} storage: ${storage?.id}, sources: ${sources.length}`);

    }

}
