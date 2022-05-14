import { UserPresenter } from "../../user/UserPresenter";
import { ArticleRepository } from "../Article/ArticleRepository";
import { TaskError } from "../error";
import { AuthorTask } from "../Task/Task";
import { TaskComponent } from "../Task/TaskComponent"; 
import { HistoryPresenter } from "./HistoryPresenter";
export class TaskPresenter {
  constructor(
    private taskComponent: TaskComponent,
    private userPresenter: UserPresenter,
    private articleRepository: ArticleRepository,
    private historyPresenter: HistoryPresenter
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
    const authorRef = author ? this.userPresenter.getUserTumbanian(author) : null;
    const editor = task.getEditor();
    const editorRef = editor ? this.userPresenter.getUserTumbanian(editor) : null;
    const article = task.getArticle();
    const articleRef = article ? this.articleRepository?.getOne(article)?.tumbanian() : null;
    return {
      ...task.toJSON(),
      editorRef: editorRef,
      authorRef: authorRef,
      articleRef: articleRef,
      history: this.taskComponent.getHistory(task.getId()!).map((r) => this.historyPresenter.taskHistory(r.toJSON())),
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
    const authorRef = author ? this.userPresenter.getUserTumbanian(author) : null;
    const editor = task.getEditor();
    const editorRef = editor ? this.userPresenter.getUserTumbanian(editor) : null;

    return {
      ...task.toJSON(),
      editorRef: editorRef,
      authorRef: authorRef,
      history: this.taskComponent.getHistory(task.getId()!).map((r) => this.historyPresenter.taskHistory(r.toJSON())),
    };
  }
}
