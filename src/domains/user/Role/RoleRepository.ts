import { DataAccessService } from "../../../utilites";
import { AccessError } from "../Error";
import { Role, RoleDAO } from "./Role";

export class RoleRepository {
  private index = new Map<number, Role>();
  private table = "Roles";
  constructor(private dataAccessService: DataAccessService) {}
  async init() {
    const cache = await this.dataAccessService.select<Role[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r);
    });
    console.log("[*]",this.table, "INIT", cache.length);
  }

  private addIndexes(u: Role) {
    this.index.set(u.getId(), u);
  }

  private removeIndex(u: Role) {
    this.index.delete(u.getId());
  }

  async save(user: Role): Promise<boolean> {
    return await this.dataAccessService.updateEntity(
      this.table,
      user.getId(),
      user.toJSON()
    );
  }

  async create(data: RoleDAO): Promise<Role> {
    const contact = await this.dataAccessService.createEntity<Role>(
      this.table,
      Object.assign(
        {
          updateAt: +new Date(),
          createAt: +new Date(),
        },
        data
      )
    );
    this.addIndexes(contact);
    return contact;
  }

  async delete(id: number): Promise<boolean> {
    const contact = await this.findOne(id);
    const result = await this.dataAccessService.deleteEntity(this.table, id);
    if (result && contact) this.removeIndex(contact);
    return result;
  }
  async findAll(): Promise<Role[]> {
    return await this.dataAccessService.select(this.table);
  }
  getAll(): Role[] {
    return Array.from(this.index.values());
  }
  async findOne(id: number): Promise<Role> {
    return await this.dataAccessService.select(this.table, id);
  }

  getOne(id: number): Role {
    if (!this.index.has(id))
      throw new AccessError("Role not found");
    return this.index.get(id)!;
  }

}
