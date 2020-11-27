export namespace ITaskCatalog {
    type Constructor<T> = {
      new(...args: any[]): T;
      readonly prototype: T;
    }
    const implementations: Constructor<ITask>[] = [];
    export function GetImplementations(): Constructor<ITask>[] {
      return implementations;
    }
    export function register<T extends Constructor<ITask>>(ctor: T) {
      implementations.push(ctor);
      return ctor;
    }
  }


