import uuid from 'uuid/v4';
import Dexie from 'dexie';
import { TProcessDTO } from '../types';

enum dbType {
  LOCAL = 'local',
  INDEX_DB = 'index_db'
};

class IndexDB extends Dexie {

  public processes: Dexie.Table<any, string> | undefined;

  constructor() {
    super('processes');

    this.version(1).stores({
      processes: '&id,userId,process,prevTask,task,state,vars'
    });
  }

}

class LocalDB {

  public storage: any[] = [];

}

class DB {

  private _db: IndexDB | undefined;
  private _local: LocalDB | undefined;
  private _type: dbType;

  constructor(type: dbType) {
    this._type = type;

    if (this._type === dbType.LOCAL) {
      this._local = new LocalDB();
    } else if (this._type === dbType.INDEX_DB) {
      this._db = new IndexDB();
    } else {
      throw new Error('DB: wrong type of database');
    }
  }

  genId(): string {
    return uuid();
  }

  async create<T>(data: TProcessDTO<T>): Promise<TProcessDTO<T>> {
    if (!data.id) {
      const id: string = this.genId();

      data.id = id;
    }


    if (this._type === dbType.INDEX_DB && this._db && this._db.processes) {
      try {
        await this._db.processes.add(data);
      } catch (err) {
        console.error(err);
  
        throw err;
      }
    } else if (this._local && this._type === dbType.LOCAL) {
      this._local.storage.push(data);
    } else {
      throw new Error('DB: wrong type of database');
    }

    return await this.get<T>(data.id);
  }

  async list<T>(userId?: string, filter?: Function): Promise<TProcessDTO<T>[]> {
    if (this._type === dbType.INDEX_DB && this._db && this._db.processes) {
      let response: TProcessDTO<T>[];

      try {
        if (filter) {
          response = await this._db.processes
            .toCollection()
            .filter((i: any) => {
              if (userId) {
                return ((i.userId === userId) && filter(i));
              } else {
                return filter(i);
              }
            })
            .toArray();
        } else {
          response = await this._db.processes.toCollection().toArray();
        }
      } catch (err) {
        console.error(err);

        throw err;
      }

      return response;
    } else if (this._local && this._type === dbType.LOCAL) {
      let response: TProcessDTO<T>[];

      if (filter) {
        response = this._local.storage.filter((i: any) => {
          if (userId) {
            return ((i.userId === userId) && filter(i));
          } else {
            return filter(i);
          }
        });
      } else {
        response = [ ...this._local.storage ];
      }

      return response;
    } else {
      throw new Error('DB: wrong type of database');
    }
  }

  async get<T>(id: string): Promise<TProcessDTO<T>> {
    if (this._type === dbType.INDEX_DB && this._db && this._db.processes) {
      let response: TProcessDTO<T>[];

      try {
        response = await this._db.processes.where('id').equals(id).toArray();
      } catch (err) {
        console.error(err);
  
        throw err;
      }
  
      if (!response[0]) {
        throw new Error('ProcessDTO not found');
      }
  
      return response[0];
    } else if (this._local && this._type === dbType.LOCAL) {
      let response: TProcessDTO<T> = this._local.storage.find((v: any): boolean => (v.id === id));

      if (!response) {
        throw new Error('ProcessDTO not found');
      }

      return response;
    } else {
      throw new Error('DB: wrong type of database');
    }
  }

  async update<T>(id: string, data: TProcessDTO<T>): Promise<TProcessDTO<T>> {
    let item: TProcessDTO<T> = await this.get<T>(id);

    item = Object.assign(item, data);

    if (item.vars) {
      item.vars = Object.assign(item.vars, data.vars);
    }

    if (this._type === dbType.INDEX_DB && this._db && this._db.processes) {
      try {
        await this._db.processes.update(id, item);
      } catch (err) {
        console.error(err);
  
        throw err;
      }
    } else if (this._local && this._type === dbType.LOCAL) {
      const idx = this._local.storage.findIndex((v: any) => (v.id === id));

      if (idx >= 0) {
        this._local.storage.splice(idx, 1);

        this._local.storage.push(item);
      }
    } else {
      throw new Error('DB: wrong type of database');
    }

    return await this.get<T>(id);
  }

  async remove<T>(id: string): Promise<TProcessDTO<T>> {
    const item: TProcessDTO<T> = await this.get<T>(id);

    if (this._type === dbType.INDEX_DB && this._db && this._db.processes) {
      try {
        await this._db.processes.delete(id);
      } catch (err) {
        console.error(err);
  
        throw err;
      }
    } else if (this._local && this._type === dbType.LOCAL) {
      const idx = this._local.storage.findIndex((v: any) => (v.id === id));

      if (idx >= 0) {
        this._local.storage.splice(idx, 1);
      }
    } else {
      throw new Error('DB: wrong type of database');
    }

    return item;
  }

  async updateVars<T>(id: string, vars: T) {
    const item: TProcessDTO<T> = await this.get<T>(id);

    item.vars = Object.assign(item.vars, vars);

    return await this.update<T>(id, item);
  }

}

export {
  DB,
  dbType
};
