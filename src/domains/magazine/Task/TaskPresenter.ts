import { User, UserDTO } from "../../user";
import { UserFacade } from "../../user/UserFacade";
import { TaskError } from "../error";
import { HistoryRepository } from "./History/HistoryRepository";
import { AuthorTask } from "./Task";

export class TaskPresenter {
  constructor(
    private histories: HistoryRepository,
    private userFacade: UserFacade
  ) {}

  /** Декоратор для редактора */
  forEditor(task?: AuthorTask[] | AuthorTask) {
    if (!task) throw new TaskError("Задание не найдено");
    if (Array.isArray(task)) {
      return this.mapForEditor(task);
    }
    return this.tapForEditor(task);
  }

  private mapForEditor(task: AuthorTask[]) {
    return task.map((t) => this.tapForEditor(t));
  }

  private tapForEditor(task: AuthorTask) {
    const author = task.getAuthor();
    const authorRef = author ? this.getUserTumbanian(author) : null;
    const editor = task.getEditor();
    const editorRef = editor ? this.getUserTumbanian(editor) : null;
    return {
      ...task.toJSON(),
      editorRef: editorRef,
      authorRef: authorRef,
      history: this.histories.getByTask(task.getId()!),
    };
  }

  /** Декоратор для автора */
  forAuthor(task?: AuthorTask[] | AuthorTask) {
    if (!task) throw new TaskError("Задание не найдено");
    if (Array.isArray(task)) {
      return this.mapForAuthor(task);
    }
    return this.tapForAuthor(task);
  }

  private mapForAuthor(task: AuthorTask[]) {
    return task.map((t) => this.tapForAuthor(t));
  }

  private tapForAuthor(task: AuthorTask) {
    const author = task.getAuthor();
    const authorRef = author ? this.getUserTumbanian(author) : null;
    const editor = task.getEditor();
    const editorRef = editor ? this.getUserTumbanian(editor) : null;
    
    return {
      ...task.toJSON(),
      editorRef: editorRef,
      authorRef: authorRef,
      history: this.histories.getByTask(task.getId()!),
    };
  }

  private getUserTumbanian(u: number) {
    const user = this.userFacade.getUserByID(u);
    const role = this.userFacade.getRoleByID(user.getRole());
    return new ClientUserTumbanian().restore(user.toJSON(), role.name);
  }
}



export class ClientUserTumbanian {
  id!: number;
  firstName!: string;
  lastName!: string;
  roleName!: string;

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  restore(user: UserDTO, roleName: string) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.roleName = roleName;
    return this;
  }
}