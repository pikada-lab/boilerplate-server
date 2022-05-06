import { DataAccessService } from "../../../utilites";
import { BaseHistory } from "./History";

export class HistoryRepository {

  private index = new Map<number, BaseHistory>();
  private indexTask = new Map<number, BaseHistory[]>();
  private table = "History";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<BaseHistory[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r); 
    });
  }
  private addIndexes(u: BaseHistory) {
    this.index.set(u.getId()!, u);
    if(!this.indexTask.has(u.getTask())) this.indexTask.set(u.getTask(), []);
    this.indexTask.get(u.getTask())?.push(u);
  }
  async create(data: History): Promise<BaseHistory> {
    const hisotory = await this.dataAccessService.createEntity<BaseHistory>(
      this.table,
      Object.assign(
        BaseHistory.create(data),
        {
          updateAt: +new Date(),
          createAt: +new Date(),
        },
        data
      )
    );
    this.addIndexes(hisotory); 
    return hisotory;
  }

  getByTask(id: number) {
    return this.indexTask.get(id) ?? [];
  }

}