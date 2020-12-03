
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
    FillTowersTask = "FillTowersTask",
    FillStorageTask = "FillStorageTask"
}
export enum LinkType {
    Harvest = "Harvest",
    Storage = "Storage",
    Edge = "Edge",
    Upgrade = "Upgrade"
}
export enum StructureTaskType {
    DefendRoomTask = "DefendRoomTask",
    TransferEnergyLinkTask = "TransferEnergyLinkTask",
    UpgradeRamparts = "UpgradeRamparts"
}

export enum SpawnLevel {
    Level1 = 1,
    Level2,
    Level3
}

export type TaskType =
  | CreepTaskType
  | StructureTaskType

export default TaskType;
