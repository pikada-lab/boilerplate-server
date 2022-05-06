import { History } from "..";

export class BaseHistory {
  private  id?: number;
  private  task!: number;
  private  date!: number;
  private  user!: number;
  private  status!: string;
  private  comment!: string;


  constructor() {}

  getId() {
    return this.id;
  }
  getTask() {
    return this.task;
  }
  static create(ref: any) {
    if(!ref.date) ref.date = new Date();
    return new BaseHistory().restore(ref);
  }

  setComment(comment: string) {
    this.comment = comment;
  }

  restore(obj: History) {
    this.id = obj.id;
    this.task = obj.task;
    this.date = obj.date;
    this.user = obj.user;
    this.status = obj.status;
    this.comment = obj.comment;
  }
 
  toJSON(): History {
    return {
      id: this.id!,
      task: this.task,
      date: this.date,
      user: this.user,
      status: this.status,
      comment: this.comment
    }
  }
}