export namespace TaskFactory {

    const handlers: {[taskType: string] : Constructor<ITask>} = {};

    export function getHandlers(): ITask[] {

      return _.map(handlers, h=> new h());
    }
    export function getTask(request: ITaskRequest): ITask | undefined{
      var task = handlers[request.type];
      if(task === undefined || task === null) return undefined;
      return new task(request);
    }
    export function register<T extends Constructor<ITask>>(ctor: T) {
      var test = new ctor();
      handlers[test.type] = ctor;
      return ctor;
    }
  }



