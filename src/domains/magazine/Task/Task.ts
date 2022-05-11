import {   Task, TaskStatus, TaskHistory } from "..";
import { TaskError } from "../error";

export class AuthorTask {
  private id?: number;

  private title!: string;
  private description!: string;

  private status: TaskStatus = "CREATED";

  private editor?: number;

  private dateEnd?: Date;
  private fee?: number;

  private author?: number;

  private article?: number;

  static create(editor: number) {
    return new AuthorTask().restore({
      title: "Новое редакционное задание",
      description: "Описание задания",
      editor,
      status: "CREATED",
    } as any);
  }

  setDescription(editor: number, ref: { title: string; description: string }) {
    if (["ENDED", "FINISHED", "CANCELED", "ARCHIVED"].includes(this.status))
      throw new TaskError("Не позволено");
    if (!this.isBelongEditor(editor)) throw new TaskError("Не позволено");
    this.title = ref.title;
    this.description = ref.description;
    return this.createHistory(editor, "Задание изменено");
  }
  setDateEnd(editor:number, dateEnd: string | number | Date) {
    if (!this.isBelongEditor(editor)) throw new TaskError("Не позволено");
    const date = new Date(dateEnd);
    if(!this.isValidDate(date)) throw new TaskError("Дата должна быть датой");
    if(+date < Date.now() + 6e3 * 60 * 24) throw new TaskError("Срок выполнения задачи должен быть больше 1 суток");
    this.dateEnd = date;
    return this.createHistory(editor, "Дата сдачи задания изменена на "+date.toJSON().substring(0,10));
  }

  private isValidDate(d: any): d is Date {
    return d instanceof Date && !isNaN(d as any);
  }

  setFee(editor: number, fee: number) {
    if (this.status !== "CREATED") throw new TaskError("Не позволено");
    if (!this.isBelongEditor(editor)) throw new TaskError("Не позволено");
    if (fee < 0)
      throw new TaskError("Не допустимо. Нельзя поставить атрицательную сумму");
    this.fee = fee;
    return this.createHistory(editor, "Установлен новый гонорар");
  }

  getFee() {
    return this.fee ?? 0;
  }

  getStatus() {
    return this.status;
  }
  getDateEnd() {
    if (!this.dateEnd) return new Date(0);
    return new Date(this.dateEnd!);
  }
  getId() {
    return this.id;
  }

  getAuthor() {
    return this.author;
  }

  setAuthor(author?: number) {
    if (this.author === author) return;
    if (!["CREATED", "PUBLISHED"].includes(this.status))
      throw new TaskError("Нельзя заменять Автора после одобрения");

    this.author = author;
  }

  getEditor() {
    return this.editor;
  }

  setEditor(editor?: number) {
    if (this.editor === editor) return;
    if (this.status !== "CREATED" && !editor)
      throw new TaskError("Нельзя у активного задания убирать автора");

    this.editor = editor;
  }

  getArticle() {
    return this.article;
  }

  createHistory(userId: number, comment?: string): TaskHistory {
    return {
      date: +new Date(),
      task: this.id!,
      user: userId,
      status: this.status,
      comment: comment ?? "",
    };
  }

  setArticle(art?: number) {
    if (this.article === art) return;
    if (["ENDED", "FINISHED", "ARCHIVED", "CANCELED"].includes(this.status))
      throw new TaskError("Нельзя заменять статью после одобрения");
    this.article = art ? art : undefined;
  }

  public canPublish(editor: number) {
    if (this.status != "CREATED") return false;
    if (!this.title) return false;
    if (!this.description) return false;
    if (!this.dateEnd || +this.dateEnd == 0) return false;
    if (!this.editor) return false;
    if (typeof this.fee === "undefined") return false;
    if (!this.isBelongEditor(editor)) return;
    return true;
  }

  // Предназначено для сервиса статей
  publish(editor: number) {
    if (this.status === "PUBLISHED") throw new TaskError("Уже исполнено");
    if (!this.canPublish(editor)) throw new TaskError("Не позволено");
    if (this.author) {
      return this.distribute(this.author);
    }
    this.status = "PUBLISHED";
    return this.createHistory(editor);
  }

  public canUnpublish(editor: number) {
    return this.status === "PUBLISHED" && this.isBelongEditor(editor);
  }

  // Предназначено для сервиса статей
  unpublish(editor: number) {
    if (this.status === "CREATED") throw new TaskError("Уже исполнено");
    if (!this.canUnpublish(editor)) throw new TaskError("Не позволено");
    this.status = "CREATED";
    return this.createHistory(editor);
  }

  public canDistribute(author: number) {
    if (this.status != "CREATED" && this.status != "PUBLISHED") return false;
    // if (!this.author) return false;
    // if (!this.isBelongAuthor(author)) return;
    return true;
  }

  distribute(author: number) {
    if (this.status === "DISTRIBUTED") throw new TaskError("Уже исполнено");
    if (!this.canDistribute(author)) throw new TaskError("Не позволено");
    this.setAuthor(author);
    this.status = "DISTRIBUTED";
    return this.createHistory(author);
  }

  public canRefuse(author: number) {
    return this.status === "DISTRIBUTED" && this.isBelongAuthor(author);
  }

  refuse(author: number) {
    if (this.status === "PUBLISHED") throw new TaskError("Уже исполнено");
    if (!this.canRefuse(author)) throw new TaskError("Не позволено");
    this.status = "PUBLISHED";
    this.setAuthor();
    return this.createHistory(author);
  }

  public canSendToResolve(author: number) {
    if (this.status === "PENDING_RESOLVE") return false;
    if (this.status != "DISTRIBUTED" && this.status != "REJECTED") return false;
    if (!this.article) return false;
    if (!this.isBelongAuthor(author)) return false;
    return true;
  }

  sendToResolve(author: number) {
    if (this.status === "PENDING_RESOLVE") throw new TaskError("Уже исполнено");
    if (!this.canSendToResolve(author)) throw new TaskError("Не позволено");
    this.status = "PENDING_RESOLVE";
    return this.createHistory(author);
  }

  public canRevision(author: number) {
    if (this.status === "DISTRIBUTED") return false;
    return this.status === "PENDING_RESOLVE" && this.isBelongAuthor(author);
  }

  revision(author: number) {
    if (this.status === "DISTRIBUTED") throw new TaskError("Уже исполнено");
    if (!this.canRevision(author)) throw new TaskError("Не позволено");
    this.status = "DISTRIBUTED";
    return this.createHistory(author);
  }

  public canReject(editor: number) {
    if (this.status === "REJECTED") return false;
    return this.status === "PENDING_RESOLVE" && this.isBelongEditor(editor);
  }

  reject(editor: number) {
    if (this.status === "REJECTED") throw new TaskError("Уже исполнено");
    if (this.status != "PENDING_RESOLVE") throw new TaskError("Не позволено");
    if (!this.isBelongEditor(editor))
      throw new TaskError("Вы не ответственный редактор");
    this.status = "REJECTED";
    return this.createHistory(editor);
  }

  public canResolve(editor: number) {
    if (this.status === "FINISHED") return false;
    return this.status == "PENDING_RESOLVE" && this.isBelongEditor(editor);
  }

  resolve(editor: number) {
    if (this.status === "FINISHED") throw new TaskError("Уже исполнено");
    if (this.status != "PENDING_RESOLVE") throw new TaskError("Не позволено");
    if (!this.isBelongEditor(editor))
      throw new TaskError("Вы не ответственный редактор");
    this.status = "FINISHED";
    return this.createHistory(editor);
  }

  public canEnd(editor: number) {
    if (this.status === "ENDED") return false;
    return this.status === "FINISHED" && this.isBelongEditor(editor);
  }

  end(editor: number) {
    if (this.status === "ENDED") throw new TaskError("Уже исполнено");
    if (this.status != "FINISHED") throw new TaskError("Не позволено");
    if (!this.isBelongEditor(editor))
      throw new TaskError("Вы не ответственный редактор");
    this.status = "ENDED";
    return this.createHistory(editor);
  }

  public canCanceled(editor: number) {
    if (this.status === "CANCELED") return false;
    return this.isBelongEditor(editor);
  }

  cancel(editor: number) {
    if (this.status === "CANCELED") throw new TaskError("Уже исполнено");
    if (!this.isBelongEditor(editor))
      throw new TaskError("Вы не ответственный редактор");
    this.status = "CANCELED";
    return this.createHistory(editor);
  }

  public canArchive(editor: number) {
    if (this.status === "ARCHIVED") return false;
    return this.status === "ENDED" || this.status === "CANCELED";
  }

  archive(editor: number) {
    if (this.status === "ARCHIVED") throw new TaskError("Уже исполнено");
    if (!this.canArchive(editor)) throw new TaskError("Не позволено");
    this.status = "ARCHIVED";
    return this.createHistory(editor);
  }

  isBelongAuthor(userId: number) {
    return this.author === userId;
  }
  isBelongEditor(userId: number) {
    return this.editor === userId;
  }

  restore(ref: Task) {
    this.id = ref.id;
    this.title = ref.title ?? "";
    this.description = ref.description ?? "";
    this.fee = ref.fee ?? 0;
    this.dateEnd = ref.dateEnd;
    this.status = ref.status ?? "CREATED";

    this.author = ref.author;
    this.article = ref.article;
    this.editor = ref.editor;

    return this;
  }

  toJSON(): Task {
    return {
      id: this.id!,
      title: this.title,
      description: this.description,
      status: this.status,
      fee: this.fee,
      dateEnd: this.dateEnd,

      author: this.author,
      article: this.article,
      editor: this.editor,
    };
  }
}
