import { RoleChecker } from "..";
import { onInit } from "../../../utilites";
import {
  RestAuthorizationRequest,
  RestFileRequest,
  RestRequest,
  ServerController,
} from "../../../utilites/ServerController";
import { AccessItem } from "../../user/Role/Role";
import { UserFacade } from "../../user/UserFacade";
import { ArticleRepository } from "../Article/ArticleRepository";
import { ArticleService } from "../Article/ArticleService";
import { ArticlePresenter } from "../Presenter/ArticlePresenter";
import { ArticlePublishService } from "../Publish/ArticlePublishService";

export class ArticleRestController implements onInit {
  constructor(
    private server: ServerController,
    private roleChecker: RoleChecker,
    private articlePresenter: ArticlePresenter, 
    private articleRepository: ArticleRepository,
    private articleService: ArticleService,
    private articlePublishService: ArticlePublishService,
    private userFacade: UserFacade
  ) {}

  async init() {
    this.setRequestController();
    this.setCommandController();
  }

  //#region  Request controls

  private setRequestController() {
    this.server.getAuth("/v1/articles/:id", async (req) => this.getArticleById(req));
    this.server.getAuth("/v1/articles/tumbanian", async (req) => this.getTumbanian(req));
    this.server.getAuth("/v1/articles/", async (req) => this.getArticles(req));
    this.server.getAuth("/v1/articles/author/:id", async (req) => this.getAuthor(req));
    this.server.getAuth("/v1/articles/editor/:id", async (req) => this.getEditor(req));
    this.server.getAuth("/v1/articles/category/:id", async (req) => this.getByCategory(req)); 
    this.server.getAuth("/v1/articles/:id/authors", async (req) => this.getAuthorsForAticle(req)); 
    this.server.getAuth("/v1/articles/:id/editors", async (req) => this.getEditorsForArticle(req)); 
  }

  private async getTumbanian(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    return this.articleService.getTumbanian();
  }

  private async getArticleById(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getOne(id);
  }
  private async getArticles(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    return this.articleRepository.getAll();
  }
  private async getAuthor(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getByAuthor(id);
  }

  private async getEditor(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getByEditor(id);
  }
  private async getByCategory(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getByCategory(id);
  }
 
  private checkNumber(num: number) {
    if (+num != num) throw new Error("Номер не число");
    if (num <= 0) throw new Error("Связь меньше или равна нулю");
  }

  getAuthorsForAticle(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    const article = this.articleRepository.getOne(id);
    if(!article) throw new Error("Статья не найдена");
    const user = this.userFacade.getAllUser().filter(r => ![1].includes(r.getRole()))
    return this.userFacade.getUserPresenter().mapForArticle(user);
  }

  getEditorsForArticle(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE); 
    const id = +req.params["id"];
    this.checkNumber(id);
    const article = this.articleRepository.getOne(id);
    if(!article) throw new Error("Статья не найдена");
    const user = this.userFacade.getAllUser().filter(r => [6,7].includes(r.getRole()))
    return  this.userFacade.getUserPresenter().mapForArticle(user);
  }
 
  //#endregion

  //#region Commands controls

  private setCommandController() {
    this.server.postAuth("/v1/articles/", async (req) => this.createArticle(req));
    this.server.patchAuth("/v1/articles/:id", async (req) => this.saveArticle(req));
    this.server.patchAuth("/v1/articles/:id/category", async (req) => this.setCategory(req));
    this.server.patchAuth("/v1/articles/:id/editor", async (req) => this.setEditor(req));
    this.server.patchAuth("/v1/articles/:id/author", async (req) => this.setAuthor(req));
    this.server.patchAuth("/v1/articles/:id/publish", async (req) => this.publishArticle(req));
    this.server.patchAuth("/v1/articles/:id/unpublish", async (req) => this.unpublishArticle(req));
    this.server.patchAuth("/v1/articles/:id/archive", async (req) => this.archiveArticle(req));
    this.server.patchAuth("/v1/articles/:id/restore", async (req) => this.restoreArticle(req)); 
    this.server.uploadAuth("/v1/articles/:id/image", async (req) => this.uploadImage(req));
    this.server.uploadAuth("/v1/articles/:id/cover", async (req) => this.uploadCoverImage(req));
    this.server.deleteAuth("/v1/articles/:id/cover", async (req) => this.removeCoverImage(req));
  }

  async createArticle(req: RestRequest & RestAuthorizationRequest) {
    const initiator = req.payload.id;
    this.checkNumber(initiator);
    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_CREATE_ARTICLE);
    return await this.articleService.create(req.body as any, initiator);
  }
  async publishArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const initiator = req.payload.id;
    this.checkNumber(initiator);
    return await this.articlePublishService.publish(id, initiator);
  }
  async unpublishArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const initiator = req.payload.id;
    this.checkNumber(initiator);
    return await this.articleService.unpublish(id, initiator);
  }
  async archiveArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const initiator = req.payload.id;
    this.checkNumber(initiator);
    return await this.articleService.archive(id, initiator);
  }
  async restoreArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const initiator = req.payload.id;
    this.checkNumber(initiator);
    return await this.articleService.unarchive(id, initiator);
  }

  async saveArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    return await this.articleService.save(req.body as any);
  }  

  async uploadImage(req: RestRequest & RestAuthorizationRequest & RestFileRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const files = (req.raw as any).files.image;
    return await this.articleService.uploadPhotoImage(id, Buffer.from(files.data));
  }

  async uploadCoverImage(req: RestRequest & RestAuthorizationRequest & RestFileRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const files = (req.raw as any).files.image;
    return await this.articleService.uploadExtraLargeImage(id, Buffer.from(files.data));
  }

  async removeCoverImage(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    return await this.articleService.removeExtraLargeImage(id);
  }

  async setCategory(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const category = +req.body.category;
    this.checkNumber(category);
    return await this.articleService.changeCategory(id, category);
  }

  async setEditor(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const editor = +req.body.editor;
    this.checkNumber(editor);
    return await this.articleService.setEditor(id, editor);
  }

  async setAuthor(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    const author = +req.body.author;
    this.checkNumber(author);
    return await this.articleService.setAuthor(id, author);
  }
  //#endregion
}
