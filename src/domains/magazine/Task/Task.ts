import { EventEmitter } from "stream";
import { Article, Task, TaskStatus } from "..";

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
      id: 0,
      title: "Новое редакционное задание",
      description: "Описание задания",
      editor,
      status: "CREATED",
    });
  }
  getId() {
    return this.id;
  }

  getAuthor() {
    return this.author;
  }

  setAuthor(author?: number) {
    if (this.author === author) return;
    if (!["CREATED", "PUBLISHED"].includes(this.status)) throw new Error("Нельзя заменять Автора после одобрения");
 
    this.author = author;
 
  }

  getEditor() {
    return this.editor;
  }

  setEditor(editor?: number) {
    if (this.editor === editor) return;
    if (this.status !== "CREATED" && !editor) throw new Error("Нельзя у активного задания убирать автора");
 
    this.editor = editor; 
  }

  getArticle() {
    return this.article;
  }

  createHistory(userId: number, comment?: string) {
    return {
      date: new Date(),
      task: this.id,
      user: userId,
      status: this.status,
      comment: comment ?? "",
    };
  }

  setArticle(art?: Article) {
    if (this.article === art?.id) return;
    if (["ENDED", "FINISHED", "ARCHIVED", "CANCELED"].includes(this.status))
      throw new Error("Нельзя заменять статью после одобрения"); 
    if (art) {
      this.article = art.id;
    } else {
      this.article = undefined;
    } 
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

  publish(editor: number) {
    if (this.status === "PUBLISHED") return [];
    if (!this.canPublish(editor)) throw new Error("Не позволено");
    if (this.author) {
      return this.distribute(this.author);
    }
    this.status = "PUBLISHED";
    return this.createHistory(editor);
  }

  public canUnpublish(editor: number) {
    return this.status === "PUBLISHED" && this.isBelongEditor(editor);
  }
  unpublish(editor: number) {
    if (!this.canUnpublish(editor)) throw new Error("Не позволено");
    this.status = "CREATED";
    this.createHistory(editor);
  }

  public canDistribute(author: number) {
    if (this.status != "CREATED" && this.status != "PUBLISHED") return false;
    if (!this.author) return false;
    if (!this.isBelongAuthor(author)) return;
    return true;
  }

  distribute(author: number) {
    if (this.status === "DISTRIBUTED") return;
    if (!this.canDistribute(author)) throw new Error("Не позволено");
    this.status = "DISTRIBUTED";
    this.createHistory(author);
  }

  public canRefuse(author: number) {
    return this.status === "DISTRIBUTED" && this.isBelongAuthor(author);
  }

  refuse(author: number) {
    if (this.status === "CREATED") return;
    if (!this.canRefuse(author)) throw new Error("Не позволено");
    this.status = "PUBLISHED";
    this.setAuthor();
    this.createHistory(author);
  }

  public canSendToResolve(author: number) {
    if (this.status === "PENDING_RESOLVE") return false;
    if (this.status != "DISTRIBUTED" && this.status != "REJECTED") return false;
    if (!this.article) return false;
    if (!this.isBelongAuthor(author)) return false;
    return true;
  }

  sendToResolve(author: number) {
    if (this.status === "PENDING_RESOLVE") return;
    if (!this.canSendToResolve(author)) throw new Error("Не позволено");
    this.status = "PENDING_RESOLVE";
    this.createHistory(author);
  }

  public canRevision(author: number) {
    if (this.status === "DISTRIBUTED") return false;
    return this.status === "PENDING_RESOLVE" && this.isBelongAuthor(author);
  }

  revision(author: number) {
    if (this.status === "DISTRIBUTED") return;
    if (!this.canRevision(author)) throw new Error("Не позволено");
    this.status = "DISTRIBUTED";
    if (!this.isBelongAuthor(author)) return;
    this.createHistory(author);
  }

  public canReject(editor: number) {
    if (this.status === "REJECTED") return false;
    return this.status === "PENDING_RESOLVE" && this.isBelongEditor(editor);
  }

  reject(editor: number) {
    if (this.status === "REJECTED") return;
    if (this.status != "PENDING_RESOLVE") throw new Error("Не позволено");
    if (!this.isBelongEditor(editor)) throw new Error("Вы не ответственный редактор");
    this.status = "REJECTED";
    this.createHistory(editor);
  }

  public canResolve(editor: number) {
    if (this.status === "FINISHED") return false;
    return this.status == "PENDING_RESOLVE" && this.isBelongEditor(editor);
  }

  resolve(editor: number) {
    if (this.status === "FINISHED") return;
    if (this.status != "PENDING_RESOLVE") throw new Error("Не позволено");
    if (!this.isBelongEditor(editor)) throw new Error("Вы не ответственный редактор");
    this.status = "FINISHED";
    this.createHistory(editor);
  }

  public canEnd(editor: number) {
    if (this.status === "ENDED") return false;
    return this.status === "FINISHED" && this.isBelongEditor(editor);
  }

  end(editor: number) {
    if (this.status === "ENDED") return;
    if (this.status != "FINISHED") throw new Error("Не позволено");
    if (!this.isBelongEditor(editor)) throw new Error("Вы не ответственный редактор");
    this.status = "ENDED";
    this.createHistory(editor);
  }

  public canCanceled(editor: number) {
    if (this.status === "CANCELED") return false;
    return this.isBelongEditor(editor);
  }

  cancel(editor: number) {
    if (this.status === "CANCELED") return;
    if (!this.isBelongEditor(editor)) throw new Error("Вы не ответственный редактор");
    this.status = "CANCELED";
    this.createHistory(editor);
  }

  public canArchive(editor: number) {
    if (this.status === "ARCHIVED") return false;
    return this.status === "ENDED" || this.status === "CANCELED";
  }

  archive(editor: number) {
    if (this.status === "ARCHIVED") return;
    if (!this.canArchive(editor)) throw new Error("Не позволено");
    this.status = "ARCHIVED";
    this.createHistory(editor);
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
