declare interface CreepMemory{
    currentTaskId: string
    currentTaskStatus: TaskStatus
    acceptedTaskTypes: import("core/types").TaskType[]
    jobType: import("core/types").JobType
}


