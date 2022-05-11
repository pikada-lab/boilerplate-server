import { Article, Task } from "..";
import { DataAccessService } from "../../../utilites";
import { MagazineError } from "../error";
import { AuthorTask } from "./Task";

type articleId = number;
type taskId = number;
type userId = number;
export class TaskRepository {
  private index = new Map<taskId, AuthorTask>();
  private indexPrevState = new Map<articleId, Task>();
  private indexAuthor = new Map<userId, Map<taskId, AuthorTask>>();
  private indexEditor = new Map<userId, Map<taskId, AuthorTask>>();
  private indexArticle = new Map<articleId, AuthorTask>();

  private table = "Task";
  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<AuthorTask[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r); 
    });
  }

  private addIndexes(u: AuthorTask) {
    this.index.set(u.getId()!, u);
    this.updateOldState(u);
    if (u.getEditor()) this.addIndexEditor(u.getEditor()!, u);
    if (u.getAuthor()) this.addIndexAuthor(u.getAuthor()!, u);
    if (u.getArticle()) this.addIndexArticle(u.getArticle()!, u);
  }

  private addIndexEditor(editor: number, u: AuthorTask) {
    if (!this.indexEditor.has(editor)) {
      this.indexEditor.set(editor, new Map());
    }
    this.indexEditor.get(editor)!.set(u.getId()!, u);
  }
  private addIndexAuthor(author: number, u: AuthorTask) {
    if (!this.indexAuthor.has(author)) {
      this.indexAuthor.set(author, new Map());
    }
    this.indexAuthor.get(author)!.set(u.getId()!, u);
  }
  private addIndexArticle(article: number, u: AuthorTask) {
    if (article) {
      this.indexArticle.set(article, u);
    } else {
      this.indexArticle.delete(article);
    }
  }
  private removeIndex(u: AuthorTask) {
    this.index.delete(u.getId()!);
    if(u.getAuthor())
    this.removeIndexAuthor(u.getAuthor()!, u);
    if(u.getEditor())
    this.removeIndexEditor(u.getEditor()!, u);
    if(u.getArticle())
    this.removeIndexArticle(u.getArticle()!);

  }
  private removeIndexAuthor(author: number, u: AuthorTask) {
    this.indexAuthor.get(author)?.delete(u.getId()!);
  }
  private removeIndexEditor(editor: number, u: AuthorTask) {
    this.indexEditor.get(editor)?.delete(u.getId()!);
  }
  private removeIndexArticle(article?: number) {
    if(article) this.indexEditor?.delete(article);
  }

  async save(task: AuthorTask): Promise<boolean> { 
    this.authorChangeHandler(task);
    this.editorChangeHandler(task);
    this.articleChangeHandler(task); 
    this.updateOldState(task);
    return await this.dataAccessService.updateEntity(this.table, task.getId()!, task.toJSON());
  }
  
  //#region handers change detections

  private authorChangeHandler(task: AuthorTask  ) {
    const author = task.getAuthor();
    const oldAuthor = this.getOldState(task)?.author;
    if(author === oldAuthor) return;
    if (oldAuthor) this.removeIndexAuthor(oldAuthor, task);
    if (author) this.addIndexAuthor(author, task);
  }
  
  private editorChangeHandler(task: AuthorTask  ) {
    const editor = task.getEditor();
    const oldEditor = this.getOldState(task)?.editor;
    if(editor === oldEditor) return;
    if (oldEditor) this.removeIndexEditor(oldEditor, task);
    if (editor) this.addIndexEditor(editor, task);
  }

  private articleChangeHandler(task: AuthorTask  ) {
    const article = task.getArticle();
    const oldArticle = this.getOldState(task)?.article;
    if(article === oldArticle) return;
    if (oldArticle) this.removeIndexArticle(oldArticle);
    if (article) this.addIndexArticle(article, task);
  }

  private getOldState(task: AuthorTask) {
    return this.indexPrevState.get(task.getId()!);
  }
  private updateOldState(task: AuthorTask) {
    this.indexPrevState.set(task.getId()!, task.toJSON());
  }
  //#endregion

  async create(data: Task | {editor: number}): Promise<AuthorTask> {
    const article = await this.dataAccessService.createEntity<AuthorTask>(
      this.table,
      Object.assign(
        AuthorTask.create(data.editor!),
        {
          updateAt: +new Date(),
          createAt: +new Date(),
        },
        data
      )
    );
    this.addIndexes(article); 
    return article;
  }

  async delete(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    const result = await this.dataAccessService.deleteEntity(this.table, id);
    if (result && user) this.removeIndex(user);
    return result;
  }

  getAll(): AuthorTask[] {
    return Array.from(this.index.values());
  }

  async findOne(id: number): Promise<AuthorTask> {
    return await this.dataAccessService.select(this.table, id);
  }

  getOne(id: number): AuthorTask {
    if (!this.index.has(id)) throw new MagazineError("Нет задания");
    return this.index.get(id)!;
  }


  getByArticle(id: number) {
    if (!this.indexArticle.has(id)) throw new MagazineError("Нет статьи");
    return this.indexArticle.get(id);
  }

  getByEditor(id: number) {
    if (!this.indexEditor.has(id)) throw new MagazineError("Нет статьи");
    return Array.from(this.indexEditor.get(id)!.values());
  }

  getByAuthor(id: number) {
    if (!this.indexAuthor.has(id)) throw new MagazineError("Нет статьи");
    return Array.from(this.indexAuthor.get(id)!.values());
  }
}
