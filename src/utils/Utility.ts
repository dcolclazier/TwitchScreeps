import {MemoryUtil} from "memory/MemoryUtil"
import {RoomUtil} from "./RoomUtil";
export class Utility implements IUtil {
    public room: RoomUtil = new RoomUtil();
    public memory: MemoryUtil = new MemoryUtil();

    public getUniqueId() : string{
        return '_' + Math.random().toString(36).substr(2,9);
    }

}
