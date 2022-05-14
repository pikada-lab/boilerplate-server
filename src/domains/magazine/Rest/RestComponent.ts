import { ServerController } from "../../../utilites/ServerController";
import { UserFacade } from "../../user/UserFacade";
import { ArticleComponent } from "../Article/ArticleComponent";
import { PresenterComponent } from "../Presenter/PresenterComponent";
import { TaskPresenter } from "../Presenter/TaskPresenter";
import { PublishComponent } from "../Publish/PublishComponent";
import { TaskComponent } from "../Task/TaskComponent";
import { ArticleRestController } from "./ArticleRestController";
import { TaskRestController } from "./TaskRestController";

export class RestComponent {
  private articleRest: ArticleRestController;
  private taskRest: TaskRestController;
  constructor(
    server: ServerController,
    articleComponent: ArticleComponent, 
    taskComponent: TaskComponent,
    publish: PublishComponent,
    presenter: PresenterComponent,
    userFacade: UserFacade,
  ) {
    this.articleRest = new ArticleRestController(
      server,
      userFacade,
      presenter.getArticlePresenter(),
      articleComponent.getArticleRepository(),
      articleComponent.getArticleService(),
      publish.getPublishService()
    );

    this.taskRest = new TaskRestController(
      server,
      userFacade,
      taskComponent.getRepository(),
      taskComponent.getService(),
      presenter.getTaskPresenter(),
      publish.getPublishService()
    );
  }

  async init() {
    this.articleRest.init();
    this.taskRest.init();
  }
}
