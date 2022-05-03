import { UserRepository } from "..";
import { DataAccessService } from "../../../utilites";
import { RoleFactory } from "./RoleFactory";
import { RoleRepository } from "./RoleRepository";
import { RoleService } from "./RoleService";

export class RoleComponent {
  private roleRepository!: RoleRepository;
  private roleService!: RoleService;
  constructor(dao: DataAccessService, userRepository: UserRepository) {
    this.roleRepository = new RoleRepository(dao);
    dao.setFactory("Roles", RoleFactory);
    this.roleService = new RoleService(userRepository, this.roleRepository);
  }

  async init() {
    await this.roleRepository.init();
    await this.roleService.init();
  }

  getService() {
    return this.roleService;
  }
}
