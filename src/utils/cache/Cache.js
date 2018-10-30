/* @flow */

export default class IndexedCache {
  _connectionOpened: bool = false;
  _indexedDB: IDBFactory = indexedDB
  _db: IDBOpenDBRequest | null;
  _idbStore: IDBObjectStore;
  index: Object;
  dbKey: string;
  storeKey: string;
  name: string;
  constructor(name: string, index: Object) {
    this.name = name;
    this.storeKey = this.name + 'Store';
    this.dbKey = this.name + 'DB';
    this.index = index;
    this._db = null;
  }

  // "Private" members
  _initDB(): Promise<Object> {
    return new Promise((resolve, reject) => {
      this._db = this._indexedDB.open(this.dbKey);
      this._db.onupgradeneeded = (event) => {
        this._updateDB(event.target.result);
      }
      this._db.onsuccess = (event: Event) => {
        if (this._idbStore === undefined) {
          this._idbStore = event.target.result;
        }
        this._connectionOpened = true;
        resolve({ data: null, success: true });
      }
      this._db.onerror = (error) => {
        reject(error);
      }
    });
  }

  _updateDB(db: IDBObjectStore): void {
    this._idbStore = (this._db.result !== undefined) ? this._db.result : db;
    let store = this._idbStore.createObjectStore(this.storeKey, { keyPath: "id" });
    store.createIndex(this.index.name, this.index.items);
  }

  open(): Promise<Object> {
    return this._initDB();
  }

  get(keys: Array<string>): Promise<Object> {
    return new Promise((resolve, reject) => {
      let transaction = this._idbStore.transaction(this.storeKey, "readwrite");
      let store = transaction.objectStore(this.storeKey);
      let index = store.index(this.index.name);
      let res = index.get(keys);
      res.onsuccess = () => {
        if (res.result !== undefined) {
          resolve({ data: res.result, success: true });
        } else {
          resolve({data: null, success: false });
        }
      }
      res.onerror = (error) => {
        reject(error);
      }
    });
  }

  add(val: Object | string | number): Promise<Object> {
    return new Promise((resolve, reject) => {
      const transaction = this._idbStore.transaction(this.storeKey, "readwrite");
      const store = transaction.objectStore(this.storeKey);
      const res = store.put(val);
      res.onsuccess = () => resolve({ data: val, success: true });
      res.onerror = (error) => reject({ data: null, success: false, error: error});
    });
  }

  remove(key: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      const transaction = this._idbStore.transaction(this.storeKey, "readwrite");
      const store = transaction.objectStore(this.storeKey);
      const res = store.delete(key);
      res.onsuccess = () => resolve({ data: null, success: true });
      res.onerror = (error) => reject({ data: null, success: false, error: error});
    });

  }

  clear(): Promise<Object> {
    return new Promise((resolve, reject) => {
      let transaction = this._idbStore.transaction(this.storeKey, "readwrite");
      let store = transaction.objectStore(this.storeKey);
      let res = store.clear();
      res.onsuccess = () => resolve({ data: null, success: true });
      res.onerror = (error) => reject({ data: null, success: false, error: error});
    });
  }

  close(): void {
    this._db.result.close();
  }
}
