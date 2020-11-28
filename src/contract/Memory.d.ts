interface Memory {
    version: number
    initialized: boolean;
    tasks: {[roomName:string] : {[requestId:string] : ITaskRequest}}
    tasksNew: Record<string, Record<import("contract/types").TaskType, Record<string, ITaskRequest>>>
    test:any
}


