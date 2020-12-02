

declare interface ITask
{
    canAssign(workerId: string) : boolean;
    addRequests(roomName: string): void;
    request: ITaskRequest;
    category : import("core/types").TaskCategory;
    type: import("core/types").TaskType;
    run(): void;
}


