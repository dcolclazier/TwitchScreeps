declare interface ITaskRequest {
    type: import("contract/types").TaskType
    category: import("contract/types").TaskCategory;
    // acceptedJobTypes: import("contract/types").JobType[]
    id: string;
    targetRoom: string;
    originatingRoom: string;
    isFinished: boolean;
    targetId: Id<RoomObject>;
}




declare interface SpawnInfo{
    jobType: import("contract/types").JobType,
    spawnCreep: boolean
    spawnLevel: import("contract/types").SpawnLevel
}
