import { UserFacade } from "../../user/UserFacade";
import { ArticleComponent } from "../Article/ArticleComponent";
import { TaskComponent } from "../Task/TaskComponent";
import { ArticlePublishService } from "./ArticlePublishService";

export class PublishComponent {
  private articlePublishService: ArticlePublishService;
  constructor(article: ArticleComponent, task: TaskComponent, userFacade: UserFacade) {
    this.articlePublishService = new ArticlePublishService(article.getArticleService(), task.getService(), userFacade);
  }

 async init() {
    await this.articlePublishService.init();
  }

  getPublishService() {
    return this.articlePublishService;
  }
} 