
declare interface ITask
{
    request: ITaskRequest
    category : import("contract/types").TaskCategory
    type: import("contract/types").TaskType
    run(): void
}


