import { ProcessManager, Process, Task } from '../src';

class Task1 extends Task {

  async _run(resolve: Function) {
    resolve();
  }

  async run() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._run(resolve);
      }, 300);
    });
  }

  async pause() {}
  async resume() {}
  async cancel() {}
}

class Task2 extends Task1 {}
class Task3 extends Task1 {}
class Task4 extends Task1 {}

class Task5 extends Task {

  async _run(resolve: Function) {
    resolve();
  }

  async run() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Custom error'));
      }, 300);
    });
  }

  async pause() {}
  async resume() {}
  async cancel() {}
}

type TVal = {
  a: 1
};

class CustomProcess extends Process<TVal, []> {
  public get name(): string { return 'test'; }
  public get tasks(): any[] { return [Task1, Task2, Task3, Task4]; }
}

class ErrorProcess extends Process<TVal, []> {
  public get name(): string { return 'test2'; }
  public get tasks(): any[] { return [Task1, Task5]; }
}

const pm = new ProcessManager('aries');

pm.register('test', CustomProcess);
pm.register('err', ErrorProcess);

export {
  Task1,
  Task2,
  Task3,
  Task4,
  Task5,
  CustomProcess,
  ErrorProcess,
  pm
};
