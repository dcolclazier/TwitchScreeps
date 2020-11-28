
interface ICreepTemplate {
    bodyParts: BodyPartConstant[];
    taskTypes: import("contract/types").TaskType[];
    maxPerRoom: number;
}
