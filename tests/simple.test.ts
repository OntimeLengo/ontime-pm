import { Process, Task } from '../src/index';
import { pm, CustomProcess, ErrorProcess, Task1, Task2, Task3, Task4, Task5 } from './pm';

type TVal = {
  a: number
};

describe('Simple process', () => {
  it('Check instance', async (next) => {
    const proc: CustomProcess = await pm.create<CustomProcess, TVal>('test', {a: 1});

    expect(proc instanceof CustomProcess).toEqual(true);
    expect(proc instanceof Process).toEqual(true);

    next();
  });

  it('Check inheritances', async (next) => {
    expect(Task1.prototype instanceof Task).toEqual(true);
    expect(Task2.prototype instanceof Task).toEqual(true);
    expect(Task3.prototype instanceof Task).toEqual(true);
    expect(Task4.prototype instanceof Task).toEqual(true);
    expect(Task5.prototype instanceof Task).toEqual(true);

    next();
  });

  it('Run process', async (next) => {
    const proc: CustomProcess = await pm.create<CustomProcess, TVal>('test', {a: 1});

    proc.run();

    proc.on('done', () => {
      expect(true).toEqual(true);

      next();
    });
  });

  it('Events', async (next) => {
    const proc: CustomProcess = await pm.create<CustomProcess, TVal>('test', {a: 1});

    const events = {
      start: 0,
      before: 0,
      task: 0
    };

    proc.run();

    proc.on('start', () => {
      events.start++;
    });

    proc.on('task/before', () => {
      events.before++;
    });

    proc.on('task', () => {
      events.task++;
    });

    proc.on('done', () => {
      expect(events.before).toEqual(4);
      expect(events.task).toEqual(4);

      next();
    });
  });

  it('Error', async (next) => {
    const proc: ErrorProcess = await pm.create<ErrorProcess, TVal>('err', {a: 1});
    
    proc.on('error', (err: Error) => {
      expect(err instanceof Error).toEqual(true);
      expect(err.message).toEqual('Custom error');

      next();
    });

    try {
      await proc.run();

      expect(true).toEqual(false);
    } catch (err) {
      expect(true).toEqual(true);
      expect(err.message).toEqual('Custom error');
    }

    proc.on('done', () => {
      expect(true).toEqual(false);

      next();
    });
  });

  it('Pause / Resume', async (next) => {
    const proc: CustomProcess = await pm.create<CustomProcess, TVal>('test', {a: 1});
    const result = {
      pause: 0,
      resume: 0
    };

    proc.on('pause', () => {
      result.pause++;

      setTimeout(() => proc.resume(), 2000);
    });

    proc.on('resume', () => {
      result.resume++;
    });

    proc.run();

    setTimeout(() => proc.pause(), 400);

    proc.on('done', () => {
      expect(result.pause).toEqual(1);
      expect(result.resume).toEqual(1);

      next();
    });
  });
});