import { ErrorMapper } from "utils/ErrorMapper";
import { TaskManager } from "core/TaskManager";
import { Utility } from "core/Utility";
import { Governor } from "core/Governor";
import { Logger, LogLevel } from "utils/Logger";

global.util = new Utility();
global.owner = "Nerdtastic";
global.taskManager = new TaskManager();


Logger.logLevel = LogLevel.INFO;
function main(){

  global.util.memory.initialize();
  for(let roomName in Game.rooms){
    new Governor(roomName).govern();
  }
  global.util.memory.cleanup();
}

export const loop = ErrorMapper.wrapLoop(main)


// Resource collection/storage
// Marketplace to buy/sell resources
// room defense (static) - towers
// room defense (dynamic)
// construction
// exploration
// expansion/defense
// offense
