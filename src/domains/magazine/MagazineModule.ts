import { DataAccessService } from "../../utilites";
import { ServerController } from "../../utilites/ServerController"; 
import { UserFacade } from "../user/UserFacade";
import { ArticleComponent } from "./Article/ArticleComponent";
import { TaskComponent } from "./Task/TaskComponent";

export class MagazineModule {
  private article: ArticleComponent;
  private task: TaskComponent;

  constructor(
    das: DataAccessService,
    server: ServerController,
    userFacade: UserFacade
  ) {
    this.task = new TaskComponent(das, server, userFacade)
    this.article = new ArticleComponent(das, server, this.task.getService(), userFacade);
  }

  async init() {
    await this.article.init();
    await this.task.init();
  }
}
