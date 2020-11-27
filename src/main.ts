import { ErrorMapper } from "utils/ErrorMapper";
import { TaskManager } from "core/TaskManager";
import { Utility } from "core/Utility";
import { Governor } from "core/Governor";

global.util = new Utility();
global.owner = "Nerdtastic";
global.taskManager = new TaskManager();



function main(){

  global.util.memory.initialize();

  for(let roomName in Game.rooms){

    new Governor(roomName).govern();
  }

  global.util.memory.cleanup();
}


export const loop = ErrorMapper.wrapLoop(main)

// function patch(param: IsCreepMemory, creepName: string){
//   const creep = Game.creeps[creepName];
//   var roleName = creep.name.split("_")[1];
//   switch(roleName){
//     case("Miner"):
//     case("MINER"):
//       creep.memory =<CreepMemory>{
//         acceptedTaskTypes: ["MineTask"],
//         currentTaskId: "",
//         currentTaskStatus: "WAITING"
//       }
//       break;
//     case("UPGRADER"):
//     case("Upgrader"):
//       creep.memory =<CreepMemory>{
//         acceptedTaskTypes: ["UpgradeTask"],
//         currentTaskId: "",
//         currentTaskStatus: "WAITING"
//       }
//       break;
//     case("Builder"):
//     case("BUILDER"):
//       creep.memory =<CreepMemory>{
//         acceptedTaskTypes: ["BuildTask"],
//         currentTaskId: "",
//         currentTaskStatus: "WAITING"
//       }
//     break;
//   }
// }

// Resource collection/storage
// Marketplace to buy/sell resources
// room defense (static) - towers
// room defense (dynamic)
// construction
// exploration
// expansion/defense
// offense
