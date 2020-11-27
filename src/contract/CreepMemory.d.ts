declare interface CreepMemory{
    currentTaskId: string
    currentTaskStatus: CreepStatus
    acceptedTaskTypes: import("./types").TaskType[]
    jobType: import("./types").JobType
}
