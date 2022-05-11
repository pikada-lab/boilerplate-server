import { RoleChecker } from "..";
import {
  RestAuthorizationRequest,
  RestRequest,
  ServerController,
} from "../../../utilites/ServerController";
import { AccessItem } from "../../user/Role/Role";
import { FeeRepository } from "./Fee/FeeRepository";
import { FeeService } from "./Fee/FeeService";

export class FeeRestController {
  constructor(
    private server: ServerController,
    private roleChecker: RoleChecker,
    private feeRepository: FeeRepository,
    private feeService: FeeService
  ) {}

  async init() {
    this.setRequestController();
    this.setCommandController();
  }

  //#region Request controls

  private setRequestController() {
    this.server.getAuth("/v1/fee/author/:id", (req) => this.getByAuthor(req));
    this.server.getAuth("/v1/fee/me", (req) => this.getByMe(req));
    this.server.getAuth("/v1/fee", (req) => this.getAll(req));
  }

  private async getByAuthor(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.params.id;
    this.roleChecker.checkUserWithThrow(
      +req.payload.id,
      AccessItem.CAN_SEE_FEE_REPORTS
    );
    const fee = this.feeRepository.getByAuthor(id);
    return fee;
  }
  private async getByMe(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.payload.id;
    const fee = this.feeRepository.getByAuthor(id);
    return fee;
  }
  private async getAll(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.payload.id;
    this.roleChecker.checkUserWithThrow(id, AccessItem.CAN_SEE_FEE_REPORTS);
    const fee = this.feeRepository.getAll();
    return fee;
  }
  //#endregion
  //#region Command controls
  private setCommandController() {
    this.server.getAuth("/v1/fee/:id/pay", (req) => this.pay(req));
    this.server.getAuth("/v1/fee/:id/cancel", (req) => this.cancel(req));
    this.server.getAuth("/v1/fee/:id/set/recipient", (req) =>
      this.setRecipient(req)
    );
  }

  private async pay(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.payload.id; 
    return await this.feeService.pay(id, +req.payload.id, req.body.comment ?? "");
  }
  private async cancel(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.payload.id; 
    return await this.feeService.cancel(id, +req.payload.id, req.body.comment ?? "");
  }
  private async setRecipient(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.payload.id; 
    return await this.feeService.cancel(id, +req.payload.id, req.body.comment ?? "");
  }
  //#endregion
}
