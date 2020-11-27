
export enum TaskCategory{
    Creep = "Creep",
    Structure = "Structure"
}


export enum JobType {
    Worker = "Worker",
    Miner = "Miner",
    Builder = "Builder",
    Upgrader = "Upgrader",
    Janitor = "Janitor"
}


export enum CreepTaskType {
    MineTask = "MineTask",
    UpgradeTask = "UpgradeTask",
    BuildTask = "BuildTask",
    RestockTask = "RestockTask",
}

export enum StructureTaskType{
}


export enum SpawnLevel {
    Level1 = 1,
    Level2
}

export type TaskType =
  | CreepTaskType
  | StructureTaskType

export default TaskType;
