import { RoleChecker } from "..";
import { RestAuthorizationRequest, RestRequest, ServerController } from "../../../utilites/ServerController";
import { AccessItem } from "../../user/Role/Role";
import { FeeRepository } from "../Fee/FeeRepository";
import { FeeService } from "../Fee/FeeService";
import { FeePresenter } from "../Presenter/FeePresenter";

export class FeeRestController {
  constructor(
    private server: ServerController,
    private roleChecker: RoleChecker,
    private repository: FeeRepository,
    private service: FeeService,
    private feePresenter: FeePresenter
  ) {}

  async init() {
    this.setRequestController();
    this.setCommandController();
  }
  setRequestController() {
    this.server.getAuth("/v1/fee/author/:id", async (req) => this.getFeeByAuthorID(req));
    this.server.getAuth("/v1/fee/me", async (req) => this.getFeeByToken(req));
    this.server.getAuth("/v1/fee/:id", async (req) => this.getFeeByID(req));
    this.server.getAuth("/v1/fee/", async (req) => this.getFee(req));
  }
  async getFee(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(+req.payload.id, AccessItem.CAN_SEE_FEE);
    const fee = this.repository.getAll();
    return this.feePresenter.mapFull(fee);
  }
  async getFeeByID(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params.id;
    this.checkNumber(id);
    this.roleChecker.checkUserWithThrow(+req.payload.id, AccessItem.CAN_SEE_FEE);
    const fee = this.repository.getOne(id);
    return this.feePresenter.full(fee);
  }
  async getFeeByAuthorID(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params.id;
    this.checkNumber(id);
    this.roleChecker.checkUserWithThrow(+req.payload.id, AccessItem.CAN_SEE_FEE);
    const fee = this.repository.getByAuthor(id);
    return this.feePresenter.mapFull(fee);
  }

  async getFeeByToken(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.payload.id;
    this.checkNumber(id);
    this.roleChecker.checkUserWithThrow(+req.payload.id, AccessItem.CAN_SEE_FEE);
    const fee = this.repository.getByAuthor(id);
    return this.feePresenter.mapFull(fee);
  }
  setCommandController() {
    this.server.patchAuth("/v1/fee/:id/execute", async (req) => this.execute(req));
    this.server.patchAuth("/v1/fee/:id/cancel", async (req) => this.cancel(req));
  }

  async execute(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(+req.payload.id, AccessItem.CAN_PAY_FEE);
    const id = +req.params.id;
    const userId = +req.payload.id;
    const comment = req.body["comment"] ?? "-";
    const account = req.body["account"] ?? null;
    this.checkNumber(id);
    this.checkNumber(userId);
   return await this.service.pay(id, userId, account, comment);
  }

  async cancel(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(+req.payload.id, AccessItem.CAN_PAY_FEE);
    const id = +req.params.id;
    const userId = +req.payload.id;
    const comment = req.body["comment"] ?? "-";
    this.checkNumber(id);
    this.checkNumber(userId);
    return await this.service.cancel(id, userId, comment);
  }

  private checkNumber(num: number) {
    if (+num != num) throw new Error("Номер не число");
    if (num <= 0) throw new Error("Связь меньше или равна нулю");
  }
 
}
