import { DataAccessService } from "../../../../utilites";
import { BaseTaskHistory } from "./History";
import {  TaskHistory} from "../.."

export class HistoryRepository {

  private index = new Map<number, BaseTaskHistory>();
  private indexTask = new Map<number, BaseTaskHistory[]>();
  private table = "TaskHistory";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<BaseTaskHistory[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r); 
    });
  }
  private addIndexes(u: BaseTaskHistory) {
    this.index.set(u.getId()!, u);
    if(!this.indexTask.has(u.getTask())) this.indexTask.set(u.getTask(), []);
    this.indexTask.get(u.getTask())?.push(u);
  }
  async create(data: TaskHistory): Promise<BaseTaskHistory> {
    const hisotory = await this.dataAccessService.createEntity<BaseTaskHistory>(
      this.table, 
        BaseTaskHistory.create(data) 
    );
    this.addIndexes(hisotory); 
    return hisotory;
  }

  getByTask(id: number) {
    return this.indexTask.get(id) ?? [];
  }

}