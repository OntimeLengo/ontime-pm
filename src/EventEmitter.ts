interface IEventEmitter {
  on(name: string, fn: Function): void;
  once(name: string, fn: Function): void;
  off(name: string, fn: Function): void;
  emit(name: string, ...args: any[]): void;
  stopListening(): void;
}

class EventEmitter implements IEventEmitter {

  private _listeners: Map<string, Set<Function>>;
  private _onceListeners: Map<string, Set<Function>>;

  constructor() {
    this._listeners = new Map();
    this._onceListeners = new Map();
  }

  on(name: string, fn: Function): void {
    let listeners = this._listeners.get(name) || new Set();

    if (typeof fn !== 'function') {
      throw new Error('Second argument must be a function');
    }

    listeners.add(fn);

    this._listeners.set(name, listeners);
  }

  once(name: string, fn: Function): void {
    let listeners = this._onceListeners.get(name) || new Set();
    
    if (typeof fn !== 'function') {
      throw new Error('Second argument must be a function');
    }

    listeners.add(fn);
    
    this._onceListeners.set(name, listeners);
  }

  off(name: string, fn: Function): void {
    let listeners = this._listeners.get(name);
    let onceListeners = this._onceListeners.get(name);
    
    if (typeof fn !== 'function') {
      throw new Error('Second argument must be a function');
    }

    if (listeners) {
      listeners.delete(fn);
    }

    if (onceListeners) {
      onceListeners.delete(fn);
    }
  }

  emit(name: string, ...args: any[]): void {
    let onceListeners = this._onceListeners.get(name);
    let listeners = this._listeners.get(name);
    let allListeners = this._listeners.get('*');

    if (onceListeners) {
      onceListeners.forEach((fn: Function) => fn(...args));

      this._onceListeners.delete(name);
    }

    if (listeners) {
      listeners.forEach((fn: Function) => fn(...args));
    }

    if (allListeners) {
      allListeners.forEach((fn: Function) => fn(name, ...args));
    }
  }

  stopListening(): void {
    this._listeners.clear();
    this._onceListeners.clear();
  }

}

export {
  EventEmitter,
  IEventEmitter
};
