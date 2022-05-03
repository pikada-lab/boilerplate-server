import { DataAccessService } from ".";

export class MemoryDataAccessService implements DataAccessService {
  private memory: Map<string, any[]> = new Map();
  private factories: Map<string, <T>(dao: any) => T> = new Map();
  private lastIds: Map<string, number> = new Map();
  constructor() {}

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
    let id = this.getIdAndInc(name);
    const item = Object.assign(dao, { id: id });
    this.memory.get(name)!.push(item);
    return this.factories.get(name)!<T>(item);
  }
  async deleteEntity(name: string, id: number): Promise<boolean> {
    this.checkName(name);
    const res = this.memory.get(name)!.findIndex((el) => el.id == id);
    if (!~res) return false;
    this.memory.get(name)!.splice(res, 1);
    return true;
  }
  async updateEntity(name: string, id: number, dao: any): Promise<boolean> {
    const res = this.memory.get(name)!.findIndex((el) => el.id == id);
    if (!~res) return false;
    let item = Object.assign(this.memory.get(name)![res], dao, { id: id });
    this.memory.get(name)!.splice(res, 1, item);
    return true;
  }
  async select<T>(name: string, id?: number): Promise<T> {
    if (!id) {
      return this.memory
        .get(name)
        ?.map((item) => this.factories.get(name)!<T>(item)) as any;
    }
    return this.memory
      .get(name)!
      ?.filter((item) => item.id == id)
      ?.map((item) => this.factories.get(name)!<T>(item))[0];
  }

  private checkName(name: string) {
    if (!this.memory.has(name)) {
      this.memory.set(name, []);
    }
  }
  private getIdAndInc(name: string) {
    const id = this.lastIds.get(name) ?? 1;
    this.lastIds.set(name, id + 1);
    return id;
  }
}
