import { DataAccessService } from "../../../utilites";
import { VerifyError } from "../Error";
import { TwoFactorSecrets } from "./TwoFactorSecrets";

export class TwoFactorRepository {
  private index = new Map<number, TwoFactorSecrets>();
  private indexBelongUser = new Map<number, TwoFactorSecrets>();

  private table = "TwoFactorSecrets";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<TwoFactorSecrets[]>(
      this.table
    );
    cache?.forEach((r) => {
      this.addIndexes(r);
    });
  }

  private addIndexes(u: TwoFactorSecrets) {
    this.index.set(u.getId()!, u);
    this.indexBelongUser.set(u.getUserId(), u);
  }
  private removeIndex(u: TwoFactorSecrets) {
    this.index.delete(u.getId()!);
    this.indexBelongUser.delete(u.getUserId()!);
  }

  /**
   * Enable, Disable
   * @param record
   * @returns
   */
  async save(record: TwoFactorSecrets): Promise<boolean> {
    return await this.dataAccessService.updateEntity(
      this.table,
      record.getId()!,
      record.toJSON()
    );
  }
  async create(data: TwoFactorSecrets): Promise<TwoFactorSecrets> {
    const record = await this.dataAccessService.createEntity<TwoFactorSecrets>(
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

  public getRecordsByUserId(userId: number) {
    const record = this.indexBelongUser.get(userId);
    if (record) return record;
    return null;
  }
}
