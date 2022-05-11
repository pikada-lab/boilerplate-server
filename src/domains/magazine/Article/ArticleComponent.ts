import { DataAccessService } from "../../../utilites";
import { ServerController } from "../../../utilites/ServerController";
import { UserFacade } from "../../user/UserFacade";
import { ImageService } from "../ImageStore";
import { TaskService } from "../Task/TaskService";
import { ArticleFactory } from "./ArticleFactory";
import { ArticlePublishService } from "./ArticlePublishService";
import { ArticleRepository } from "./ArticleRepository";
import { ArticleRestController } from "./ArticleRestController";
import { ArticleService } from "./ArticleService";
import { HistoryFactory } from "./History/HistoryFactory";
import { HistoryRepository } from "./History/HistoryRepository";

export class ArticleComponent {
  private imageService: ImageService;
  private articleRepository: ArticleRepository;
  private articleService: ArticleService;
  private rest: ArticleRestController;
  private articlePublishService: ArticlePublishService;
  private historyRepository: HistoryRepository;

  constructor(
    das: DataAccessService,
    server: ServerController,
    taskService: TaskService,
    userFacade: UserFacade
  ) {
    this.imageService = new ImageService();
    this.articleRepository = new ArticleRepository(das);
    das.setFactory("Articles", ArticleFactory);
    this.historyRepository = new HistoryRepository(das);
    das.setFactory("ArticleHistory", HistoryFactory);

    this.articleService = new ArticleService(
      this.articleRepository,
      this.imageService,
      userFacade,
      this.historyRepository
    );
    this.articlePublishService = new ArticlePublishService(
      this.articleService,
      taskService,
      userFacade
    );
    this.rest = new ArticleRestController(
      server,
      userFacade,
      this.articleRepository,
      this.articleService,
      this.articlePublishService
    );
  }

  async init() {
    await Promise.all([
      this.historyRepository.init(),
      this.imageService.init(),
      this.articleRepository.init(),
      this.articleService.init(),
      this.articlePublishService.init(),
      this.rest.init(),
    ]);
  }
}
