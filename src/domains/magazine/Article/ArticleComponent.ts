import { DataAccessService } from "../../../utilites";
import { ServerController } from "../../../utilites/ServerController";
import { UserFacade } from "../../user/UserFacade";
import { ImageService } from "../ImageStore"; 
import { TaskService } from "../Task/TaskService";
import { ArticleFactory } from "./ArticleFactory"; 
import { ArticleRepository } from "./ArticleRepository"; 
import { ArticleService } from "./ArticleService";
import { HistoryFactory } from "./History/HistoryFactory";
import { HistoryRepository } from "./History/HistoryRepository";

export class ArticleComponent {
  private imageService: ImageService;
  private articleRepository: ArticleRepository;
  private articleService: ArticleService; 
  private historyRepository: HistoryRepository;

  constructor(das: DataAccessService,    userFacade: UserFacade) {
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
  }

  async init() {
    await Promise.all([
      this.historyRepository.init(),
      this.imageService.init(),
      this.articleRepository.init(),
      this.articleService.init(),  
    ]);
  }

  getHistory(articleId: number) {
    return this.historyRepository.getByArticle(articleId);
  }
  getArticleRepository() {
    return this.articleRepository;
  }

  getArticleService() {
    return this.articleService;
  }
}
