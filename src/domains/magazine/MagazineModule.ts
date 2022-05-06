import { DataAccessService } from "../../utilites";
import { ServerController } from "../../utilites/ServerController"; 
import {  RoleChecker } from "./Article/ArticleRestController";
import { ArticleComponent } from "./Article/ArticleComponent";

export class MagazineModule {
   
  private article: ArticleComponent;

  constructor(das: DataAccessService, server: ServerController, roleChecker: RoleChecker) { 
    this.article = new ArticleComponent(das, server, roleChecker);
  }


  async init() { 
    await this.article.init();
  }
}