import { UserFacade } from "../../user/UserFacade";
import { ArticleComponent } from "../Article/ArticleComponent"; 
import { TaskComponent } from "../Task/TaskComponent";
import { ArticlePresenter } from "./ArticlePresenter";
import { CategoryPresentor } from "./CategoryPresenter";
import { FeePresenter } from "./FeePresenter";
import { HistoryPresenter } from "./HistoryPresenter";
import { TaskPresenter } from "./TaskPresenter";

/**
 * Компонент отвечает за запросы к агрегированным сущностям, он их собирает вместе
 */
export class PresenterComponent {
  private historyPresenter: HistoryPresenter;
  private taskPresenter: TaskPresenter;
  private articlePresenter: ArticlePresenter;
  private feePresenter: FeePresenter;
  private categoryPresenter: CategoryPresentor;
  constructor(taskComponent: TaskComponent, articleComponent: ArticleComponent, userFacade: UserFacade) {
    this.categoryPresenter = new CategoryPresentor();
    this.feePresenter = new FeePresenter();
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

  getCategoryPresenter() {
    return this.categoryPresenter;
  }

  getFeePresenter() {
    return this.feePresenter;
  }

}
