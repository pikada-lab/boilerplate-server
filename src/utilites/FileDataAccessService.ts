import { DataAccessService } from ".";
var Storage = require("node-storage");

export class FileDataAccessService implements DataAccessService {
  private storages: Map<string, Storage> = new Map();
  private factories: Map<string, <T>(dao: any) => T> = new Map();
  constructor(private root: string) {}

  setFactory(name: string, factory: <T>(dao: any) => T) {
    this.checkName(name);
    this.factories.set(name, factory);
  }

  async request<T>(name: string, sql: string): Promise<T> {
    this.checkName(name);
    console.log(`select * from ${name} where ${sql}`);
    throw new Error("Method request with SQL not implemented.");
  }
  async createEntity<T>(name: string, dao: any): Promise<T> {
    this.checkName(name);
    const storage = this.storages.get(name)!;
    let id = await this.getIdAndInc(name);
    const item = this.factories.get(name)!<any>(Object.assign(dao, { id: id }));

    const items = (await storage.get("items")) || [];
    items.push(item.toJSON());
    await storage.put("items", items);

    return item as T;
  }
  async deleteEntity(name: string, id: number): Promise<boolean> {
    const items = (await this.storages.get(name)!.get("items")) || [];
    const res = items.findIndex((r: any) => r.id === id);
    if (!~res) return false;
    items.splice(res, 1); 
    await this.storages.get(name)!.put("items", items);
    return true;
  }
  async updateEntity(name: string, id: number, dao: any): Promise<boolean> {
    const items = (await this.storages.get(name)!.get("items")) || [];
    const res = items.findIndex((r: any) => r.id === id);
    if (!~res) return false;
    let item = Object.assign(items[res], dao, { id: id });
    items.splice(res, 1, item);
    await this.storages.get(name)!.put("items", items);
    return true;
  }
  async select<T>(name: string, id?: number): Promise<T> {
    if (!id) {
      return ((await this.storages.get(name)!.get("items")) || []).map(
        (item: any) => this.factories.get(name)!<T>(item)
      ) as any;
    }

    return ((await this.storages.get(name)!.get("items")) || [])
      ?.filter((item: any) => item.id == id)
      ?.map((item: any) => this.factories.get(name)!<T>(item))[0];
  }

  private async checkName(name: string) {
    if (!this.storages.has(name)) {
      try {
        const store = new Storage(this.root + "/" + name + ".db");
        await this.storages.set(name, store);
      } catch (ex) {
        console.log("Создать файл");
      }
    }
  }

  private async getIdAndInc(name: string) {
    let inc = (await (this.storages.get(name)!.get("inc") as number)) || 0;
    let id = ++inc;
    await this.storages.get(name)!.put("inc", inc);
    return id;
  }
}
