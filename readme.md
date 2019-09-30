<h1>Ontime Process manager</h1>

The library is used to manage and control some processes which you are able to run in the browser or NodeJS.
There is sometimes need to split a complicated process into small pieces of code. 
It means that you can create simple tasks and combine them into the one process.

**Process manager** - allows you to controll your processes.

**Process** - allows you to controll tasks.

**Task** - simple iteration.

---

<h2>Install</h2>

```bash
yarn add ontime-pm

// or

npm install ontime-pm
```

<h2>Example</h2>

```typescript
// index.ts
import { ProcessManager, Process, Task } from 'ontime-pm';

// Create instance of process manager
const processManager: ProcessManager = new ProcessManager('user');

// Create Tasks classes
class Task1 extends Task {
  
  async run() {
    console.log('Task 1. Do something...');
  }

  async pause() {}
  async resume() {}
  async cancel() {}
}

class Task2 extends Task {
  
  async run() {
    console.log('Task 2. Do something...');
  }

  async pause() {}
  async resume() {}
  async cancel() {}
}

class Task3 extends Task {
  
  async run() {
    console.log('Task 3. Do something...');
  }

  async pause() {}
  async resume() {}
  async cancel() {}
}

// Create Custom Process class
class CustomProcess extends Process<{}, []> {
  public get name(): string { return 'test'; }
  public get tasks(): any[] { return [Task1, Task2, Task3]; }
}

// Register custom process inside process manager
pm.register('test', CustomProcess);

// Create a new instance of custom process
const proc: CustomProcess = await pm.create('test');

// subscribe on all events
proc.on('*', (...args: any[]) => console.log(...args));

// run custom process
proc.run();
```

---

<h2>Process manager</h2>

<dl>
  <dt>
    <h4>constructor(userId: string = '')</h4>
  </dt>
  <dd>
    - userId - Optional. User ID.
  </dd>
  
  <dt>
    <h4>register&lt;P&gt;(processName: string, procClass: P): void</h4>
  </dt>
  <dd>
    The method registers a class process in the system
    - processName - process name
    - procClass - process class
  </dd>

  <dt>
    <h4>create&lt;P, V&gt;(processName: string, options: V, restoreId?: string): Promise&lt;P&gt;</h4>
  </dt>
  <dd>
    The method creates new process instance.
    The method returns new instance.
    
    - processName - process name
    - options - process variables
    - restoreId. Optional. Using for restore process context.
  </dd>

  <dt>
    <h4>status(processId: string): Promise&lt;TStatus&gt;</h4>
  <dt>
  <dd>
    The method returns a status of an instance of a process

    - processId - process ID
  </dd>

  <dt>
    <h4>get(processId: string): Promise&lt;Process&gt;</h4>
  <dt>
  <dd>
    The method returns an instance of Process by a process ID

    - processId - process ID
  </dd>

  <dt>
    <h4>list(): Promise&lt;Process[]&gt;</h4>
  <dt>
  <dd>
    The method returns a list of active processes
  </dd>
</dl>

---

<h2>Process&lt;V, T extends Task[] | Function[]&gt;</h2>

- V generic of variables

<dl>
  <dt>
    <h4>id: string</h4>
  </dt>
  <dd>
    Process ID
  </dd>

  <dt>
    <h4>name: string</h4>
  </dt>
  <dd>
    Process name. Getter property.
  </dd>

  <dt>
    <h4>tasks: T[]</h4>
  </dt>
  <dd>
    Process tasks. Getter property.
  </dd>

  <dt>
    <h4>constructor(userId: string = '', vars: V | Object = {}, restoreId?: string)</h4>
  </dt>
  <dd>
    - userId - Optional. User ID.
    - vars - Optional. Process variables.
    - restoreId - Optional. Using for restore process context.
  </dd>

  <dt>
    <h4>run(): Promise&lt;void&gt;</h4>
  </dt>
  <dd>
    The method runs the process to execute
  </dd>

  <dt>
    <h4>cancel(): Promise&lt;void&gt;</h4>
  </dt>
  <dd>
    The method cancels the process
  </dd>

  <dt>
    <h4>pause(): Promise&lt;void&gt;</h4>
  </dt>
  <dd>
    The method pauses the process
  </dd>

  <dt>
    <h4>resume(): Promise&lt;void&gt;</h4>
  </dt>
  <dd>
    The method resumes the process
  </dd>

  <dt>
    <h4>status(): Promise&lt;TStatus&gt;
  </dt>
  <dd>
    The method returns a status of the process
  </dd>

  <dt>
    <h4>getVars(): Promise&lt;V&gt;
  </dt>
  <dd>
    The method returns process variables
  </dd>
</dl>

---

<h2>Task</h2>
<dl>
  <dt>
    <h4>destroy(): void</h4>
  </dt>
  <dd>
    Destructor
  </dd>

  <dt>
    <h4>cancel(): Promise&lt;void&gt;</h4>
  </dt>
  <dd>
    The method cancels the task
  </dd>

  <dt>
    <h4>pause(): Promise&lt;void&gt;</h4>
  </dt>
  <dd>
    The method pauses the task
  </dd>

  <dt>
    <h4>resume(): Promise&lt;void&gt;</h4>
  </dt>
  <dd>
    The method resumes the task
  </dd>
</dl>

Others API depends on the implementation
