import { ErrorMapper } from "utils/ErrorMapper";
import { TaskManager } from "tasks/base/TaskManager";
import { Utility } from "utils/Utility";
import { EventHandlerTest, Governor } from "core/Governor";
import { Logger, LogLevel } from "utils/Logger";

global.util = new Utility();
global.owner = "Nerdtastic";
global.taskManager = new TaskManager();
global.memoryVersion = 0;
 //STILL NEED TO HANDLE REGISTERING NEW BUILDINGS...

Logger.logLevel = LogLevel.DEBUG;
function main(){

  global.util.memory.initialize();
  for(let roomName in Game.rooms){
    EventHandlerTest.HandleEvents(roomName);
    new Governor(roomName).govern();
  }
  global.util.memory.cleanup();
}

export const loop = ErrorMapper.wrapLoop(main)


//roads, road repair (manual, 1 tower max to repair)
//
//workers
//wall bolstering
//mining to links
//mining to containers
//  if source has no registered link, and no registered miner, mine task
// registered link, linkmine task, linkminer creep
// registered container, containermine task, containerminer creep
//registering new structure memory upon build



//linking to controllers/storage (source -> storage, storage -> controller)

// Resource collection/storage
// Marketplace to buy/sell resources
// room defense (static) - towers
// room defense (dynamic)
// construction
// exploration
// expansion/defense
// offense
