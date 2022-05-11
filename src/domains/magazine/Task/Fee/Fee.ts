import { Fee, FeeStatus, Task } from "../..";
import { AuthorTask } from "../Task";

export class TaskFee {
  private id!: number;
  private user!: number;
  private dateCreated!: number;
  private dateExecuted?: number;
  private value!: number;
  private task!: number;
  private comment!: string;
  private status!: FeeStatus;
  private account?: number;

  constructor() {}
  getId() {
    return this.id;
  }

  getAuthor() {
    return this.user;
  }
  setAuthor(author: number) {
    if (this.status !== "CREATED") throw new Error("Уже закрыто");
    if (this.user === author) throw new Error("Уже определён");
    this.user = author;
  }
  static create(task: AuthorTask, comment: string) {
    const fee: Fee = Object({
      user: task.getAuthor()!,
      dateCreated: new Date(),
      value: task.getFee(),
      task: task.getId(),
      comment,
      status: "CREATED",
    }) as any;
    return new TaskFee().restore(fee);
  }

  pay(comment: string) {
    if (this.status === "PAID") throw new Error("Уже завершено");
    if (!this.value) throw new Error("Не указана сумма");
    if (!this.account) throw new Error("Не указан счёт");
    this.dateExecuted = +new Date();
    this.status = "PAID";
    this.comment = comment;
  }

  cancel(comment: string) {
    if (this.status != "CREATED") throw new Error("Уже завершено");
    this.status = "CANCELED";
    this.comment = comment;
  }

  restore(fee: Fee) {
    this.id = fee.id;
    this.user = fee.user;
    this.dateCreated = fee.dateCreated;
    this.dateExecuted = fee.dateExecuted;
    this.value = fee.value;
    this.task = fee.task;
    this.comment = fee.comment;
    this.status = fee.status;
    this.account = fee.account;
  }

  toJSON(): Fee {
    return {
      id: this.id,
      user: this.user,
      dateCreated: this.dateCreated,
      dateExecuted: this.dateExecuted,
      value: this.value,
      task: this.task,
      comment: this.comment,
      status: this.status,
      account: this.account,
    };
  }
}
