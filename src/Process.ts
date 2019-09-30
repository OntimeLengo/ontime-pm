import { EventEmitter } from './EventEmitter';
import { DB, dbType } from './db';
import { TProcessDTO, TStatus } from './types';
import { States } from './states';
import { Task } from './Task';

abstract class Process<V, T extends Task[] | Function[]> extends EventEmitter {

  private _db: DB;
  private _currentStep: any = null;

  public id: string = '';

  public get name(): string { throw new Error('Getter property "name" is not implemented'); }
  public get tasks(): T[] { throw new Error('Getter property "tasks" is not implemented'); }

  constructor(userId: string = '', vars: V | Object = {}, restoreId?: string) {
    super();

    this._currentStep = null;

    if (typeof process === 'object') {
      this._db = new DB(dbType.LOCAL);
    } else {
      this._db = new DB(dbType.INDEX_DB);
    }

    if (restoreId) {
      this.id = restoreId;
    } else {
      const id: string = this._db.genId();
      const procDTO: TProcessDTO<V | Object> = {
        id,
        userId,
        process: this.name,
        step: 0,
        state: States.START,
        vars: vars || {}
      };
      
      this.id = id;

      this._db.create(procDTO);
    }
  }

  private async _getDTO(): Promise<TProcessDTO<V>> {
    const procDTO: TProcessDTO<V> = await this._db.get<V>(this.id);

    return procDTO;
  }

  private async _setState(state: States): Promise<TProcessDTO<V>> {
    const procDTO: TProcessDTO<V> = await this._getDTO();

    procDTO.state = state;

    return await this._db.update(this.id, procDTO);
  }

  private async _setStep(step: number): Promise<TProcessDTO<V>> {
    const procDTO: TProcessDTO<V> = await this._getDTO();

    procDTO.step = step;

    return await this._db.update(this.id, procDTO);
  }

  private async _runTask(task: any, currentStep: number, len: number, resolve: Function, reject: Function): Promise<any> {
    let procDTO: TProcessDTO<V> = await this._getDTO();

    if (procDTO.state === States.PAUSE) {
      setTimeout(() => this._runTask(task, currentStep, len, resolve, reject), 1000);

      return;
    }

    if (procDTO.state === States.DONE || procDTO.state === States.CANCEL || procDTO.state === States.ERROR) {
      return;
    }

    if (currentStep === len) {
      return;
    }

    if (currentStep === 0 && procDTO.state === States.START) {
      procDTO = await this._setState(States.IN_PROGRESS);

      this.emit(States.START, procDTO);
    }

    if (procDTO.state === States.IN_PROGRESS) {
      procDTO = await this._setStep(currentStep);
      task = await this.gateway(task, currentStep, procDTO);

      this.emit('task/before', procDTO);

      if (task.prototype instanceof Task) {
        let cls: any = task;
        let events: Function = (name: string, ...evArgs: any[]) => this.emit('task/' + name, ...evArgs);
        let t: any = new cls(this._db);
        let error: Error | undefined;

        this._currentStep = t;

        t.on('*', events);

        try {
          await t.run();
        } catch (err) {
          error = err;
        }

        if (error) {
          procDTO = await this._setState(States.ERROR);
    
          this.emit(States.ERROR, error, procDTO);
    
          reject(error);
        } else {
          procDTO = await this._getDTO();
    
          this.emit('task', procDTO, currentStep);

          resolve();
        }

        t.off('*', events);

        t.destroy();
      } else if (typeof task === 'function') {
        let error: Error | undefined;

        this._currentStep = task;

        try {
          await task(this._db);
        } catch (err) {
          error = err;
        }

        if (error) {
          procDTO = await this._setState(States.ERROR);
    
          this.emit(States.ERROR, error, procDTO);
    
          reject(error);
        } else {
          procDTO = await this._getDTO();
    
          this.emit('task', procDTO);

          resolve();
        }
      } else {
        let error: Error = new Error('Process: unknown task');

        procDTO = await this._setState(States.ERROR);
    
        this.emit(States.ERROR, error, procDTO);

        reject(error);
      }
    }
  }

  private _delayRunTask(task: any, currentStep: number, len: number): Promise<any> {
    return new Promise((resolve: Function, reject: Function) => this._runTask(task, currentStep, len, resolve, reject));
  }

  private async * runTasks(): AsyncGenerator<any> {
    const procDTO: TProcessDTO<V> = await this._getDTO();
    const startStep: number = procDTO.step;
    const len: number = this.tasks.length;

    for (let i = startStep; i < len; i++) {
      try {
        await this._delayRunTask(this.tasks[i], i, len);
      } catch (err) {
        throw err;
      }

      yield;
    }

    return true;
  }

  private async _run() {
    const iterator: AsyncGenerator = this.runTasks();

    while (true) {
      let result: IteratorResult<unknown, any> = await iterator.next();

      if (result.done) {
        this.emit(States.DONE);

        break;
      }
    }

    return true;
  }

  public run(): Promise<void> {
    return new Promise((resolve: Function, reject: Function) => {
      setTimeout(async () => {
        try {
          await this._run();

          resolve();
        } catch (err) {
          reject(err)
        }
      }, 0);
    });
  }

  public async gateway(task: Task | Function, step?: number, procDTO?: TProcessDTO<V>): Promise<Task | Function> {
    return task;
  }

  public async pause(): Promise<void> {
    let procDTO: TProcessDTO<V> = await this._getDTO();

    if (procDTO.state === States.IN_PROGRESS) {
      procDTO = await this._setState(States.PAUSE);
  
      if (this._currentStep && this._currentStep.pause) {
        await this._currentStep.pause();

        this.emit(States.PAUSE, procDTO);
      }
    } else {
      throw new Error('Process: you can pause process only with status "in progress"');
    }
  }

  public async resume(): Promise<void> {
    let procDTO: TProcessDTO<V> = await this._getDTO();

    if (procDTO.state === States.PAUSE) {
      procDTO = await this._setState(States.IN_PROGRESS);
  
      if (this._currentStep && this._currentStep.resume) {
        await this._currentStep.resume();

        this.emit('resume', procDTO);
      }
    } else {
      throw new Error('Process: you can resume process only with status "pause"');
    }
  }

  public async cancel(): Promise<void> {
    let procDTO: TProcessDTO<V> = await this._getDTO();

    const state: States = procDTO.state;

    if (state === States.START || state === States.IN_PROGRESS || state === States.PAUSE) {
      procDTO = await this._setState(States.CANCEL);
  
      if (this._currentStep && this._currentStep.cancel) {
        await this._currentStep.cancel();

        this.emit(States.CANCEL, procDTO);
      }
    } else {
      throw new Error('Process: you can cancel process only with statused "start | in progress | pause"');
    }
  }
  
  public async status(): Promise<TStatus> {
    const procDTO: TProcessDTO<V> = await this._getDTO();

    const status: TStatus = {
      process: procDTO.process,
      step: procDTO.step,
      state: procDTO.state
    };

    return status;
  }

  public async getVars(): Promise<V> {
    const procDTO: TProcessDTO<V> = await this._getDTO();

    return procDTO.vars;
  }

  public getCurrentStep(): any {
    return this._currentStep;
  }

}

export {
  Process
};
