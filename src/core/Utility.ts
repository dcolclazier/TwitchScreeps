import {RoomUtil} from "core/RoomUtil"
import {MemoryUtil} from "core/MemoryUtil"
export class Utility implements IUtil {
    public room: RoomUtil = new RoomUtil();
    public memory: MemoryUtil = new MemoryUtil();

}
