// interface Memory {
//   uuid: number;
//   log: any;
// }

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    // log: any;
    util: IUtil
    taskManager: TaskManager
    owner: string
    creepCatalog: CreepCatalog
    creepTaskCatalog: CreepTaskCatalog
    structureTaskCatalog: StructureTaskCatalog
  }
}
interface ICreepTask extends ITask
{
    image: string;
}
declare class RoomUtil {
    public fillup(creepName: string, resourceType: ResourceConstant, cleanup?: boolean): void
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
  public getTasks(roomName: string, type: import("./core/types").TaskType) : ITaskRequest[];
  public runTasks(roomName:string) : void;
}

interface ICreepTemplate {
  bodyParts: BodyPartConstant[];
  taskTypes: import("core/types").TaskType[];
  maxPerRoom: number;
}
declare interface ITaskInfo{
  priority: number,
}
declare interface ICreepTaskInfo extends ITaskInfo{
  creepsPerTask: Record<import("./core/types").JobType, number>
  acceptedJobTypes: import("./core/types").JobType[]
}
declare interface IStructureTaskInfo extends ITaskInfo{
  maxStructuresPerTask: number
}

type StructureTaskCatalog = Record<import("./core/types").StructureTaskType, Record<import("./core/types").SpawnLevel, IStructureTaskInfo>>
type CreepTaskCatalog = Record<import("./core/types").CreepTaskType, Record<import("./core/types").SpawnLevel, ICreepTaskInfo>>
type CreepCatalog = Record<import("./core/types").JobType, Record<import("./core/types").SpawnLevel, ICreepTemplate>>

type IsCreepMemory = { acceptedTaskTypes: import("./core/types").TaskType[] }
type HasPos = { pos: RoomPosition };
type HasStore = { store: StoreDefinition };


type StructuresByType = {[structureType:string] : Id<AnyOwnedStructure>[]}
type TaskStatus =
    | WAITING
    | PREPARING
    | WORKING
    | COOLDOWN
    | DONE


type ROOM_OBJECT_SOURCE = "source";

type WAITING = "WAITING"
type PREPARING = "PREPARING"
type WORKING = "WORKING"
type COOLDOWN = "COOLDOWN"
type DONE = "DONE"




type RoomObjectConstant =
    | ROOM_OBJECT_SOURCE



type MemoryObjectConstant =
    | StructureConstant
    | RoomObjectConstant

type Constructor<T> = {
      new(...args: any[]): T;
      readonly prototype: T;
    };
