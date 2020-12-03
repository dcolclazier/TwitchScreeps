interface RoomMemory{

    initialized: boolean
    sources: import("../room/SourceMemory").SourceMemory[]
    //links: Record<string, LinkMemory>
}


