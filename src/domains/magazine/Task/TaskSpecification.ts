import { Task, TaskStatus } from "..";
import { AuthorTask } from "./Task";

export interface Specification {
  and(sp: Specification): Specification;
  or(sp: Specification): Specification;
  not(): Specification;
  predicat(): (task: AuthorTask) => boolean;
}

export interface TaskSpecificationPosible {
  author?: number;
  editor?: number;
  article?: number;
  status?: TaskStatus;
  dateEnd?: Date;
  dateEndGr?: Date;
  dateEndLt?: Date;
}
export class TaskSpecification implements Specification {
  private fn: (task: AuthorTask) => boolean;
  private fns: ((task: AuthorTask) => boolean)[] = [];
  constructor(equal: TaskSpecificationPosible) {
    if (equal.author)
      this.fns.push((task: AuthorTask) => task.getAuthor() === equal.author);
    if (equal.editor)
      this.fns.push((task: AuthorTask) => task.getEditor() === equal.editor);
    if (equal.article)
      this.fns.push((task: AuthorTask) => task.getArticle() === equal.article);
    if (equal.status)
      this.fns.push((task: AuthorTask) => task.getStatus() === equal.status);
    if (equal.dateEnd) {
      this.fns.push(
        (task: AuthorTask) =>
          task.getDateEnd().getFullYear() === equal.dateEnd?.getFullYear() &&
          task.getDateEnd().getMonth() === equal.dateEnd?.getMonth() &&
          task.getDateEnd().getDate() === equal.dateEnd.getDate()
      );
    } else {
      if (equal.dateEndGr) {
        this.fns.push(
          (task: AuthorTask) => task.getDateEnd() >= equal.dateEndGr!
        );
      }
      if (equal.dateEndLt) {
        this.fns.push(
          (task: AuthorTask) => task.getDateEnd() <= equal.dateEndGr!
        );
      }
    }
    if (this.fns.length === 0)
      throw new Error("Не достаточно правил для поиска");
    this.fn = (t: AuthorTask) => this.fns.every((fn) => fn(t));
  }

  and(sp: Specification): Specification {
    this.fns.push(sp.predicat());
    this.fn = (t: AuthorTask) => this.fns.every((fn) => fn(t));
    return this;
  }

  or(sp: Specification): Specification {
    this.fn = (t: AuthorTask) =>
      this.fns.every((fn) => fn(t)) || sp.predicat()(t);
    return this;
  }

  not() {
    this.fn = (t: AuthorTask) => !this.fns.some((fn) => fn(t));
    return this;
  }

  predicat() {
    return this.fn;
  }
}
