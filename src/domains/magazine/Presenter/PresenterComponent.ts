import { ServerController } from "../../../utilites/ServerController";
import { UserFacade } from "../../user/UserFacade";
import { ArticleComponent } from "../Article/ArticleComponent";
import { HistoryRepository } from "../Article/History/HistoryRepository";
import { TaskComponent } from "../Task/TaskComponent";
import { ArticlePresenter } from "./ArticlePresenter";
import { HistoryPresenter } from "./HistoryPresenter";
import { TaskPresenter } from "./TaskPresenter";

/**
 * Компонент отвечает за запросы к агрегированным сущностям, он их собирает вместе
 */
export class PresenterComponent {
  private historyPresenter: HistoryPresenter;
  private taskPresenter: TaskPresenter;
  private articlePresenter: ArticlePresenter;
  constructor(taskComponent: TaskComponent, articleComponent: ArticleComponent, userFacade: UserFacade) {
    this.historyPresenter = new HistoryPresenter(userFacade.getUserPresenter(), articleComponent, taskComponent);
    this.taskPresenter = new TaskPresenter(
      taskComponent,
      userFacade.getUserPresenter(),
      articleComponent.getArticleRepository(),
      this.historyPresenter
    );
    this.articlePresenter = new ArticlePresenter(
      articleComponent,
      taskComponent.getRepository(),
      this.taskPresenter,
      userFacade.getUserPresenter(),
      this.historyPresenter
    );
  }

  async init() {}

  getTaskPresenter() {
    return this.taskPresenter;
  }

  getArticlePresenter() {
    return this.articlePresenter;
  }

}
