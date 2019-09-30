import { EventEmitter } from './EventEmitter';
import { States } from './states';
import { TStatus } from './types';

class ProcessManager extends EventEmitter {
  
  private _registeredProcesses: Map<string, any> = new Map();
  private _activeProcesses: Map<string, any> = new Map();

  public userId: string = '';

  constructor(userId: string = '') {
    super();

    this.userId = userId;
  }

  register<P>(processName: string, procClass: P): void {
    this._registeredProcesses.set(processName, procClass);
  }

  async create<P, V>(processName: string, options: V, restoreId?: string): Promise<P> {
    const cls: any = this._registeredProcesses.get(processName);
    const proc: any = restoreId ? new cls(this.userId, options, restoreId) : new cls(this.userId, options);

    this._activeProcesses.set(proc.id, proc);

    const events: Function = () => {
      proc.off(States.CANCEL, events);
      proc.off(States.ERROR, events);
      proc.off(States.DONE, events);

      this._activeProcesses.delete(proc.id);
    };

    proc.on(States.CANCEL, events);
    proc.on(States.ERROR, events);
    proc.on(States.DONE, events);

    return proc;
  }
  
  async status(processId: string): Promise<TStatus> {
    const proc: any = this._activeProcesses.get(processId);

    if (proc) {
      return await proc.status();
    } else {
      throw new Error('Process ID: "' + processId + '" not found');
    }
  }
  
  get<P>(processId: string): P {
    const proc: P = this._activeProcesses.get(processId);

    if (proc) {
      return proc;
    } else {
      throw new Error('Process ID: "' + processId + '" not found');
    }
  }
  
  list<P>(filter?: (val: P) => boolean): P[] {
    const list: P[] = Array.from(this._activeProcesses.values());

    return filter ? list.filter(filter) : list;
  }

}

export {
  ProcessManager
};
