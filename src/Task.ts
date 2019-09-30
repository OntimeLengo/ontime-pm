import { EventEmitter } from './EventEmitter';
import { DB } from './db';

interface ITask {
  run(): Promise<any>;
  destroy(): void;
  pause(): Promise<void>;
  resume(): Promise<void>;
  cancel(): Promise<void>;
}

abstract class Task extends EventEmitter implements ITask {

  constructor(private _db: DB) {
    super();
  }

  async run(): Promise<any> {
    throw new Error('Method "run" is not implemented');
  }

  destroy(): void {
    delete this._db;

    this.stopListening();
  }

  async pause(): Promise<void> {
    throw new Error('Method "pause" is not implemented');
  }

  async resume(): Promise<void> {
    throw new Error('Method "resume" is not implemented');
  }

  async cancel(): Promise<void> {
    throw new Error('Method "cancel" is not implemented');
  }

}

export {
  Task,
  ITask
};
