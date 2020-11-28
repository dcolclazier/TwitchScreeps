interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
    util: IUtil
    taskManager: TaskManager
    owner: string
    creepCatalog: CreepCatalog
    taskCatalog: TaskCatalog
  }
}
interface ICreepTask extends ITask
{
    image: string;
}
declare class RoomUtil {
    public fillup(creepName: string, resourceType: ResourceConstant, cleanup?: boolean) : boolean
    public getRestockables(roomName: string) : AnyOwnedStructure[];
}
declare class MemoryUtil{
    public cleanupCreeps() : void
    public clearMemory() : void
    public initialize() : void
    public cleanup() : void
}
declare class TaskManager{

  public addTaskRequest(request: ITaskRequest): void;
  public getTasks(roomName: string, type: import("./contract/types").TaskType) : ITaskRequest[];
  public runTasks(roomName:string) : void;
}
declare interface ITaskInformation{
  priority: number,
  creepsPerTask: Record<import("./contract/types").JobType, number>
  acceptedJobTypes: import("./contract/types").JobType[]
}
type TaskCatalog = Record<import("./contract/types").TaskType, Record<import("./contract/types").SpawnLevel,ITaskInformation>>
type CreepCatalog = Record<import("./contract/types").JobType, Record<import("./contract/types").SpawnLevel, ICreepTemplate>>

type IsCreepMemory = { acceptedTaskTypes: import("./contract/types").TaskType[] }
type HasPos = { pos: RoomPosition };
type HasStore = { store: StoreDefinition };
