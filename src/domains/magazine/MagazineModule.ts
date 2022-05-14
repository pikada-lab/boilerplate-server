import { DataAccessService } from "../../utilites";
import { ServerController } from "../../utilites/ServerController"; 
import { UserFacade } from "../user/UserFacade";
import { ArticleComponent } from "./Article/ArticleComponent";
import { PresenterComponent } from "./Presenter/PresenterComponent";
import { PublishComponent } from "./Publish/PublishComponent";
import { RestComponent } from "./Rest/RestComponent";
import { TaskComponent } from "./Task/TaskComponent";

export class MagazineModule {
  private article: ArticleComponent;
  private task: TaskComponent;
  private presenter: PresenterComponent;
  private publish: PublishComponent;
  private rest: RestComponent;
  constructor(
    das: DataAccessService,
    server: ServerController,
    userFacade: UserFacade
  ) {
    this.task = new TaskComponent(das,   userFacade)
    this.article = new ArticleComponent(das,  userFacade);
    this.publish = new PublishComponent(this.article, this.task, userFacade);
    this.presenter = new PresenterComponent(this.task, this.article, userFacade);
    this.rest = new RestComponent(server, this.article, this.task, this.publish, this.presenter, userFacade);
  }

  async init() {
    await this.article.init();
    await this.task.init();
    await this.publish.init();
    await this.presenter.init();
    await this.rest.init();
  }
}
