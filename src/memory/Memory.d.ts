interface Memory {
    version: number
    initialized: boolean;
    // tasks: {[roomName:string] : {[requestId:string] : ITaskRequest}}

    structures: {[roomName:string] : {[structureType:string]: {[structureId:string] : IStructureMemory}}}

    //todo - easier to index when I have more room
    tasksN: {[roomName:string] : {[taskType:string]: {[requestId:string] : ITaskRequest}}}
 }


