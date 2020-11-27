
interface ICreepTemplate {
    bodyParts: BodyPartConstant[];
    taskTypes: import("contract/types").TaskType[];
    creepsPerTask: Record<import("contract/types").CreepTaskType, number>;
    maxPerRoom: number;
}
