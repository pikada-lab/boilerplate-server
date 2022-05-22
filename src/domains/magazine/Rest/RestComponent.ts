import { ServerController } from "../../../utilites/ServerController";
import { UserFacade } from "../../user/UserFacade";
import { ArticleComponent } from "../Article/ArticleComponent";
import { CategoryComponent } from "../Category/CategoryComponent";
import { FeeComponent } from "../Fee/FeeComponent";
import { PresenterComponent } from "../Presenter/PresenterComponent"; 
import { PublishComponent } from "../Publish/PublishComponent";
import { TaskComponent } from "../Task/TaskComponent";
import { ArticleRestController } from "./ArticleRestController";
import { CategoryRestController } from "./CategoryRestController";
import { FeeRestController } from "./FeeRestController";
import { TaskRestController } from "./TaskRestController";

export class RestComponent {
  private articleRest: ArticleRestController;
  private taskRest: TaskRestController;
  private categoryRest: CategoryRestController;
  private feeRest: FeeRestController;
  constructor(
    server: ServerController,
    articleComponent: ArticleComponent,
    taskComponent: TaskComponent,
    categoryComponent: CategoryComponent,
    feeComponent: FeeComponent,
    publish: PublishComponent,
    presenter: PresenterComponent,
    userFacade: UserFacade
  ) {
    this.categoryRest = new CategoryRestController(
      server,
      userFacade,
      categoryComponent.getCategoryRepository(),
      categoryComponent.getCategoryService(),
      presenter.getCategoryPresenter()
    );

    this.articleRest = new ArticleRestController(
      server,
      userFacade,
      presenter.getArticlePresenter(),
      articleComponent.getArticleRepository(),
      articleComponent.getArticleService(),
      publish.getPublishService(),
      userFacade
    );

    this.taskRest = new TaskRestController(
      server,
      userFacade,
      taskComponent.getRepository(),
      taskComponent.getService(),
      presenter.getTaskPresenter(),
      publish.getPublishService()
    );

    this.feeRest = new FeeRestController(
      server,
      userFacade,
      feeComponent.getRepository(),
      feeComponent.getService(),
      presenter.getFeePresenter()
    );
  }

  async init() {
    await this.categoryRest.init();
    await this.articleRest.init();
    await this.taskRest.init();
    await this.feeRest.init();
  }
}
