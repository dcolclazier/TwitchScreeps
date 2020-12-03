
export abstract class RoomObjectMemory<T extends RoomObject> {
    id: Id<T>;
    abstract roomObjectType: RoomObjectConstant;

    constructor(id: Id<T>) { this.id = id; }
}
