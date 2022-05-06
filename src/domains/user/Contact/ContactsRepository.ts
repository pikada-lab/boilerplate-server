import { UserContact, UserContactDTO } from "..";
import { DataAccessService } from "../../../utilites";
import { UserFinderError } from "../Error";

export class ContactsRepository {
  private index = new Map<number, UserContact>();
  private indexUser = new Map<number, Map<number, UserContact>>();
  private table = "Contacts";
  constructor(private dataAccessService: DataAccessService) {}
  async init() {
    const cache = await this.dataAccessService.select<UserContact[]>(
      this.table
    );
    cache?.forEach((r) => {
      this.addIndexes(r);
    });
    console.log("[*]",this.table, "INIT", cache.length);
  }

  private addIndexes(u: UserContact) {
    this.index.set(u.getId(), u);

    if (!this.indexUser.has(u.getUserId()))
      this.indexUser.set(u.getUserId(), new Map<number, UserContact>());
    this.indexUser.get(u.getUserId())!.set(u.getId(), u);
  }

  private removeIndex(u: UserContact) {
    this.index.delete(u.getId());
    this.indexUser.get(u.getUserId())?.delete(u.getId());
  }

  async save(user: UserContact): Promise<boolean> {
    return await this.dataAccessService.updateEntity(
      this.table,
      user.getId(),
      user.toJSON()
    );
  }

  async create(data: UserContactDTO): Promise<UserContact> {
    const contact = await this.dataAccessService.createEntity<UserContact>(
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
  async findAll(): Promise<UserContact[]> {
    return await this.dataAccessService.select(this.table);
  }
  getAll(): UserContact[] {
    return Array.from(this.index.values());
  }
  async findOne(id: number): Promise<UserContact> {
    return await this.dataAccessService.select(this.table, id);
  }

  getOne(id: number): UserContact {
    if (!this.index.has(id))
      throw new UserFinderError("Нет уникального номера контакта");
    return this.index.get(id)!;
  }

  getByUserId(userId: number) {
    if (!this.indexUser.has(userId)) return [];
    return Array.from(this.indexUser.get(userId)!.values());
  }
}
