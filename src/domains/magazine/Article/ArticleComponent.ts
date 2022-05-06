import { DataAccessService } from "../../../utilites";
import { ServerController } from "../../../utilites/ServerController"; 
import { ImageService } from "../ImageStore";
import { ArticleFactory } from "./ArticleFactory";
import { ArticleRepository } from "./ArticleRepository";
import { ArticleRestController, RoleChecker } from "./ArticleRestController";
import { ArticleService } from "./ArticleService";

export class ArticleComponent {

  private imageService: ImageService;
  private articleRepository: ArticleRepository;
  private articleService: ArticleService; 
  private rest: any;

  constructor(das: DataAccessService, server: ServerController, roleChecker: RoleChecker) {

    this.imageService = new ImageService();
    this.articleRepository = new ArticleRepository(das);
    das.setFactory("Articles",ArticleFactory); 

    this.articleService = new ArticleService(this.articleRepository, this.imageService);

    this.rest = new ArticleRestController(server, roleChecker, this.articleRepository, this.articleService);

  }


  async init() {
    await this.imageService.init();
    await this.articleRepository.init();
    await this.articleService.init(); 
    await this.rest.init();
  }
}