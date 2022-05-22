import { Article, ArticleStatus, Task } from "..";
import { DataAccessService } from "../../../utilites";
import { MagazineError } from "../error";
import { BaseArticle } from "./Article";

type articleId = number;

export class ArticleRepository { 
  private index = new Map<articleId, BaseArticle>();
  private indexPrevState = new Map<articleId, Article>();
  private indexAuthor = new Map<number, Map<articleId, BaseArticle>>();
  private indexEditor = new Map<number, Map<articleId, BaseArticle>>(); 
  private indexStatus = new Map<ArticleStatus, Map<articleId, BaseArticle>>();
  private indexCategory = new Map<number, Map<articleId, BaseArticle>>();

  private table = "Articles";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<BaseArticle[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r); 
    });
  }

  private addIndexes(u: BaseArticle) { 
    this.index.set(u.getId(), u);
    this.updateOldState(u);
    if (u.getAuthor()) this.addIndexAuthor(u.getAuthor()!, u);
    this.addIndexEditor(u.getEditor(), u);
    this.addIndexCategory(u.getCategory(), u);
    this.addIndexStatus(u.getStatus(), u); 
  }

  private addIndexAuthor(author: number, u: BaseArticle) {
    if (!this.indexAuthor.has(author)) {
      this.indexAuthor.set(author, new Map());
    }
    this.indexAuthor.get(author)!.set(u.getId(), u);
  }
  private addIndexEditor(edit: number, u: BaseArticle) {
    if (!this.indexEditor.has(edit)) {
      this.indexEditor.set(edit, new Map());
    }
    this.indexEditor.get(edit)!.set(u.getId(), u);
  }
  private addIndexCategory(category: number, u: BaseArticle) {
    if (!this.indexCategory.has(category)) {
      this.indexCategory.set(category, new Map());
    }
    this.indexCategory.get(category)!.set(u.getId(), u);
  }

  private addIndexStatus(status: ArticleStatus, u: BaseArticle) {
    if (!this.indexStatus.has(status)) {
      this.indexStatus.set(status, new Map());
    }
    this.indexStatus.get(status)!.set(u.getId(), u);
  }
 
  private removeIndex(u: BaseArticle) {
    this.index.delete(u.getId());
    if (u.getAuthor()) this.removeIndexAuthor(u.getAuthor()!, u);
    this.removeIndexEditor(u.getEditor(), u);
    this.removeIndexCategory(u.getCategory(), u);
    this.removeIndexStatus(u.getStatus(), u); 
    this.removeItemOldState(u.getId());
  }

  private removeIndexAuthor(author: number, u: BaseArticle) {
    this.indexAuthor.get(author)?.delete(u.getId());
  }
  private removeIndexEditor(editor: number, u: BaseArticle) {
    this.indexEditor.get(editor)?.delete(u.getId());
  }

  private removeIndexCategory(category: number, u: BaseArticle) {
    this.indexCategory.get(category)?.delete(u.getId());
  }

  private removeIndexStatus(status: ArticleStatus, u: BaseArticle) {
    this.indexStatus.get(status)?.delete(u.getId());
  }
 
  async save(article: BaseArticle): Promise<boolean> { 
    this.authorChangeHandler(article);
    this.editorChangeHandler(article);
    this.categoryChangeHandler(article);
    this.statusChangeHandler(article);
    this.updateOldState(article);
    return await this.dataAccessService.updateEntity(this.table, article.getId(), article.toJSON());
  }
  async create(data: Article): Promise<BaseArticle> {
    const article = await this.dataAccessService.createEntity<BaseArticle>(
      this.table,
      Object.assign(
        BaseArticle.create(data.author, data.editor, data.task),
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

  //#region handers change detections
 
  private authorChangeHandler(article: BaseArticle  ) {
    const author = article.getAuthor();
    const oldAuthor = this.getOldState(article)?.author;
    if(author === oldAuthor) return;
    if (oldAuthor) this.removeIndexAuthor(oldAuthor, article);
    if (author) this.addIndexAuthor(author, article);
  }
  private editorChangeHandler(article: BaseArticle  ) {
    const editor = article.getEditor();
    const oldEditor = this.getOldState(article)?.editor;
    if(editor === oldEditor) return;
    if (oldEditor) this.removeIndexEditor(oldEditor, article);
    if (editor) this.addIndexEditor(editor, article);
  }
  private categoryChangeHandler(article: BaseArticle  ) {
    const category = article.getCategory();
    const oldCategory = this.getOldState(article)?.category;
    if(category === oldCategory) return;
    if (oldCategory) this.removeIndexCategory(oldCategory, article);
    if (category) this.addIndexCategory(category, article);
  }

  private statusChangeHandler(article: BaseArticle  ) {
    const status = article.getStatus();
    const oldStatus = this.getOldState(article)?.status;
    if(status === oldStatus) return;
    if (oldStatus) this.removeIndexStatus(oldStatus, article);
    if (status) this.addIndexStatus(status, article);
  }

  private getOldState(article: BaseArticle) {
    return this.indexPrevState.get(article.getId());
  }
  private updateOldState(article: BaseArticle) {
    this.indexPrevState.set(article.getId(), article.toJSON());
  }
  private removeItemOldState(articleId: number) {
    this.indexPrevState.delete(articleId);
  }

  //#endregion
 
  async delete(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    const result = await this.dataAccessService.deleteEntity(this.table, id);
    if (result && user) this.removeIndex(user);
    return result;
  }
  async findAll(): Promise<BaseArticle[]> {
    return await this.dataAccessService.select(this.table);
  }

  getAll(): BaseArticle[] {
    return Array.from(this.index.values());
  }

  async findOne(id: number): Promise<BaseArticle> {
    return await this.dataAccessService.select(this.table, id);
  }

  getOne(id: number): BaseArticle {
    if (!this.index.has(id)) throw new MagazineError("Нет статьи");
    return this.index.get(id)!;
  }

  getByEditor(id: number) {
    if (!this.indexEditor.has(id)) throw new MagazineError("Нет статьи");
    return Array.from(this.indexEditor.get(id)!.values());
  }

  getByAuthor(id: number) {
    if (!this.indexAuthor.has(id)) throw new MagazineError("Нет статьи");
    return Array.from(this.indexAuthor.get(id)!.values());
  }
 

  getByStatus(status: ArticleStatus) {
    if (!this.indexStatus.has(status)) throw new MagazineError("Нет статьи");
    return Array.from(this.indexStatus.get(status)!.values());
  }

  getByCategory(category: number) {
    if (!this.indexCategory.has(category)) throw new MagazineError("Нет статьи");
    return Array.from(this.indexCategory.get(category)!.values());
  }
}
