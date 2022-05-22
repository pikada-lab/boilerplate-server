import { RoleChecker } from "..";
import { onInit } from "../../../utilites";
import { RestAuthorizationRequest, RestRequest, ServerController } from "../../../utilites/ServerController";
import { AccessItem } from "../../user/Role/Role";
import { CategoryLike } from "../Category/Category";
import { CategoryRepository, CategoryStore } from "../Category/CategoryRepository";
import { CategoryService } from "../Category/CategoryService";
import { CategoryPresentor } from "../Presenter/CategoryPresenter";

export class CategoryRestController implements onInit {
  constructor(
    private server: ServerController,
    private roleChecker: RoleChecker,
    private categoryRepository: CategoryStore,
    private categoryService: CategoryService,
    private categoryPresenter: CategoryPresentor
  ) {}

  async init() {
    this.setRequestController();
    this.setCommandController();
  }
  setRequestController() {
    this.server.getAuth("/v1/category/:id", async (req) => this.getCategoryId(req));
    this.server.getAuth("/v1/category/", async (req) => this.getCategories(req));
  }

  private getCategoryId(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params.id;
    this.checkNumber(id);
    const category = this.categoryRepository.getOne(id);
    return this.categoryPresenter.full(category);
  }

  private getCategories(req: RestAuthorizationRequest) {
    const categories = this.categoryRepository.getAll();
    return this.categoryPresenter.mapFull(categories);
  }

  setCommandController() {
    this.server.patchAuth("/v1/category/:id/publish", async (req) => this.publish(req));
    this.server.patchAuth("/v1/category/:id/unpublish", async (req) => this.unpublish(req));
    this.server.patchAuth("/v1/category/:id", async (req) => this.edit(req));
    this.server.deleteAuth("/v1/category/:id", async (req) => this.delete(req));
    this.server.patchAuth("/v1/category/sort", async (req) => this.sort(req));
    this.server.postAuth("/v1/category/", async (req) => this.add(req));
  }

  private async publish(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_EDIT_CATEGORY);
    const id = +req.params.id;
    this.checkNumber(id);
    return await this.categoryService.publish(id);
  }
  private async unpublish(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_EDIT_CATEGORY);
    const id = +req.params.id;
    this.checkNumber(id);
    return await this.categoryService.unpublish(id);
  }

  private async edit(req: RestRequest & RestAuthorizationRequest) {
    this.checkUserEditCategory(req);
    const id = +req.params.id;
    this.checkNumber(id);
    return await this.categoryService.edit(id, {
      name: req.body["name"],
      about: req.body["about"],
    });
  } 

  private async delete(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_EDIT_CATEGORY);
    const id = +req.params.id;
    this.checkNumber(id);
    return await this.categoryService.delete(id);
  }

  private async add(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_EDIT_CATEGORY);
    const category = await this.categoryService.add(req.body as any);
    return this.categoryPresenter.full(category);
  }

  private async sort(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_EDIT_CATEGORY);
    if (!Array.isArray(req.body)) throw new Error("Статьи должны быть поданы в виде упорядоченного массива");
    const order = req.body.map((id) => +id);
    return await this.categoryService.order(order);
  }

  private checkNumber(num: number) {
    if (+num != num) throw new Error("Номер не число");
    if (num <= 0) throw new Error("Связь меньше или равна нулю");
  }

  checkUserEditCategory(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_EDIT_CATEGORY);
  }
}
