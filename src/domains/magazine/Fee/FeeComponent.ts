import { DataAccessService } from "../../../utilites";
import { UserFacade } from "../../user/UserFacade";
import { FeeFactory } from "./FeeFactory";
import { FeeRepository } from "./FeeRepository";
import { FeeService } from "./FeeService";

export class FeeComponent {
  private feeRepository: FeeRepository;
  private feeService: FeeService;
  constructor(das: DataAccessService, userFacade: UserFacade) {
    this.feeRepository = new FeeRepository(das);
    das.setFactory("Fee", FeeFactory)
    this.feeService = new FeeService(this.feeRepository, userFacade);
  }

  async init() {
    await this.feeRepository.init();
    await this.feeService.init();
  }

  getService() {
    return this.feeService;
  }
  getRepository() {
    return this.feeRepository;
  }
}