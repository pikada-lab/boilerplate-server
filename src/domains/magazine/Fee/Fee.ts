import { Fee, FeeStatus } from "..";
import { AuthorTask } from "../Task/Task";

 

export class TaskFee {
  private id!: number;
  private user!: number; 
  private value!: number;
  private task!: number;

  private comment!: string;
  private executeComment?: string;
  private account?: string; 

  private status!: FeeStatus; 

  private dateCreated!: number;
  private dateExecuted?: number;

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
  setAccount(account: string) {
    this.account = account;
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
    this.executeComment = comment;
  }

  cancel(comment: string) {
    if (this.status != "CREATED") throw new Error("Уже завершено");
    this.status = "CANCELED";
    this.executeComment = comment;
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
    this.executeComment = fee.executeComment;
    return this;
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
      executeComment: this.executeComment,
    };
  }
}
