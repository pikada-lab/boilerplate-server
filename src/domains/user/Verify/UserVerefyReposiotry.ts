import { DataAccessService } from "../../../utilites";
import { VerifyError } from "../Error";
import { UserVerifyRecord, VerifyType } from "./UserVerifyRecord";

export class UserVerifyRepository {
  private index = new Map<number, UserVerifyRecord>();
  private indexTypeAndUser = new Map<VerifyType, Map<number, UserVerifyRecord[]>>();

  private table = "VerifyRecord";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<UserVerifyRecord[]>(
      this.table
    );
    cache?.forEach((r) => {
      this.addIndexes(r);
    });
    console.log("[*]",this.table, "INIT", cache.length);
  }

  private addIndexes(u: UserVerifyRecord) {
    this.index.set(u.getId()!, u);
    if (!this.indexTypeAndUser.has(u.getType())) {
      this.indexTypeAndUser.set(u.getType(), new Map());
    }
    if (!this.indexTypeAndUser.get(u.getType())?.has(u.getUser())) {
      this.indexTypeAndUser.get(u.getType())!.set(u.getUser(), []);
    }

    const index = this.indexTypeAndUser
      .get(u.getType())!
      .get(u.getUser())!
      .findIndex((r) => r.getId() === u.getId());

    if (!~index) {
      this.indexTypeAndUser.get(u.getType())!.get(u.getUser())!.push(u);
    }
  }
  private removeIndex(u: UserVerifyRecord) {
    this.index.delete(u.getId()!);

    const index = this.indexTypeAndUser
      .get(u.getType())
      ?.get(u.getUser())
      ?.findIndex((r) => r.getId() === u.getId());

    if (typeof index == "number" && ~index) {
      this.indexTypeAndUser
        .get(u.getType())!
        .get(u.getUser())!
        .splice(index, 1);
      if (
        this.indexTypeAndUser.get(u.getType())!.get(u.getUser())!.length == 0
      ) {
        this.indexTypeAndUser.get(u.getType())!.delete(u.getUser());
      }
    }
  }

  removeAllUserRecords() {}

  removeAllExpiredRecords() {
    for (let [id, items] of this.index.entries()) {
      if (items.isExpired()) {
        this.delete(id);
      }
    }
  }

  /**
   * @deprecated  
   * @param record 
   * @returns 
   */
  async save(record: UserVerifyRecord): Promise<boolean> {
    return await this.dataAccessService.updateEntity(
      this.table,
      record.getId()!,
      record.toJSON()
    );
  }
  async create(data: UserVerifyRecord): Promise<UserVerifyRecord> {
    const record = await this.dataAccessService.createEntity<UserVerifyRecord>(
      this.table,
      Object.assign(
        {
          updateAt: +new Date(),
          createAt: +new Date(),
        },
        data
      )
    );
    this.addIndexes(record);
    return record;
  }

  async delete(id: number): Promise<boolean> {
    const record = await this.findOne(id);
    const result = await this.dataAccessService.deleteEntity(this.table, id);
    if (result && record) this.removeIndex(record);
    return result;
  }

  private findOne(id: number) {
    return this.index.get(id);
  }

  public getRecordsByUserAndType(type: VerifyType, userId: number) {
    const record = this.indexTypeAndUser.get(type)?.get(userId);
    if(record) return record;
    throw new VerifyError("Запись не найдена")
  }


}
