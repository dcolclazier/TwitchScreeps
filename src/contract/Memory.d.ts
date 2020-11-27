interface Memory {
    version: number
    initialized: boolean;
    tasks: {[roomName:string] : {[requestId:string] : ITaskRequest}}
    test:any
  }


