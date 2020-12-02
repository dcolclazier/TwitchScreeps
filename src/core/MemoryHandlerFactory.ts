
export namespace MemoryHandlerFactory {

  const implementations: { [taskType: string]: Constructor<IMemoryHandler>; } = {};

  export function getHandlers(): Constructor<IMemoryHandler>[] {
    return _.map(implementations, i => i);
  }
  export function getHandler(type: MemoryObjectConstant): Constructor<IMemoryHandler> | undefined {
    return implementations[type];
  }

  export function register<T extends Constructor<IMemoryHandler>>(ctor: T) {
    var m = new ctor();
    implementations[m.memoryObjectType] = ctor;
    return ctor;
  }
}
