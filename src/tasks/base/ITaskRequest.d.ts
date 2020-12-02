declare interface ITaskRequest {
    type: import("core/types").TaskType
    category: import("core/types").TaskCategory;
    id: string;
    targetRoom: string;
    isFinished: boolean;
    targetId: Id<RoomObject> | undefined;
}


declare interface SpawnInfo{
    jobType: import("core/types").JobType,
    spawnCreep: boolean
    spawnLevel: import("core/types").SpawnLevel
}
