import { Fee, Task } from "../..";
import { DataAccessService } from "../../../../utilites";
import { AuthorTask } from "../Task";
import { TaskFee } from "./Fee";

export class FeeRepository {
  private index = new Map<number, TaskFee>();
  private indexPrevState = new Map<number, Fee>();
  private indexUser = new Map<number, TaskFee[]>();
  private table = "Fee";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<TaskFee[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r);
    });
  }

  private addIndexes(fee: TaskFee) {
    this.indexPrevState.set(fee.getId()!, fee.toJSON());
    this.index.set(fee.getId()!, fee);
    this.addIndexUser(fee.getAuthor(), fee);
  }

  async create(task: AuthorTask, comment: string): Promise<TaskFee> {
    const hisotory = await this.dataAccessService.createEntity<TaskFee>(
      this.table,
      TaskFee.create(task, comment)
    );
    this.addIndexes(hisotory);
    return hisotory;
  }

  async save(fee: TaskFee): Promise<boolean> {
    const res = await this.dataAccessService.updateEntity(
      this.table,
      fee.getId()!,
      fee.toJSON()
    );
    if (!res) return false;
    this.authorChangeHandler(fee);

    return true;
  }
  private authorChangeHandler(fee: TaskFee) {
    const author = fee.getAuthor();
    const oldAuthor = this.indexPrevState.get(fee.getId())!.user;
    if (author === oldAuthor) return;
    this.removeIndexUser(fee.getId(), oldAuthor);
    this.addIndexUser(author, fee);
  }
  private addIndexUser(newAuthor: number, fee: TaskFee) {
    if (!this.indexUser.has(newAuthor)) this.indexUser.set(newAuthor, []);
    this.indexUser.get(newAuthor)?.push(fee);
  }
  private removeIndexUser(id: number, oldAuthor: number) {
    const index = this.indexUser
      .get(oldAuthor)!
      .findIndex((f) => f.getId() === id);
    if (~index) {
      this.indexUser.get(oldAuthor)!.splice(index, 1);
    }
  }

  getByAuthor(id: number) {
    return this.indexUser.get(id) ?? [];
  }

  getAll() {
    return Array.from(this.index.values());
  }

  getOne(id: number) {
    const fee = this.index.get(id);
    if (!fee) throw new Error("Нет выплаты с таким номером");
    return fee;
  }
}
