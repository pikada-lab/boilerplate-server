import { Article } from "..";
import { UserFacade } from "../../user/UserFacade";
import { UserPresenter } from "../../user/UserPresenter";
import { BaseArticle } from "../Article/Article";
import { ArticleComponent } from "../Article/ArticleComponent";
import { ArticleError } from "../error";
import { TaskComponent } from "../Task/TaskComponent";
import { TaskRepository } from "../Task/TaskRepository";
import { HistoryPresenter } from "./HistoryPresenter";
import { TaskPresenter } from "./TaskPresenter";

export class ArticlePresenter {
  constructor(
    private articleComponent: ArticleComponent,
    private taskRepository: TaskRepository,
    private taskPresenter: TaskPresenter,
    private userPresenter: UserPresenter,
    private historyPresenter: HistoryPresenter
  ) {}

  /** Декоратор для редактора */
  forEditor(article?: BaseArticle[] | BaseArticle) {
    if (!article) throw new ArticleError("Статья не найдено");
    if (Array.isArray(article)) {
      return this.mapForEditor(article);
    }
    return this.tapForEditor(article);
  }

  private mapForEditor(article: BaseArticle[]) {
    return article.map((t) => this.tapForEditor(t));
  }

  private tapForEditor(article: BaseArticle) {
    const author = article.getAuthor();
    const authorRef = author ? this.userPresenter.getUserTumbanian(author) : null;
    const editor = article.getEditor();
    const editorRef = editor ? this.userPresenter.getUserTumbanian(editor) : null;
    const task = this.taskRepository.getByArticle(article.getId());

    const taskOriginal = task ? task : null;
    const taskRef = taskOriginal ? this.taskPresenter.forEditor(taskOriginal) : null;
    return {
      ...article.toJSON(),
      editorRef: editorRef,
      authorRef: authorRef,
      taskRef: taskRef,
      history: this.articleComponent
        .getHistory(article.getId())
        .map((r) => this.historyPresenter.articleHistory(r.toJSON())),
    };
  }
}
