import { User, UserRepository } from ".";
import { NotificationService } from "./NotificationService";
import { AccessItem, Role } from "./Role/Role";
import { RoleService } from "./Role/RoleService";
import { UserAuthorizationService } from "./services";
import { UserPresenter } from "./UserPresenter";

export interface UserFacade {
  send(userId: number, subject: string, text: string): Promise<boolean>;
  upgradeTrainee(userId: number): Promise<void>;
  checkUserWithThrow(userId: number, access: AccessItem): void;
  getUserByID(userId: number): User;
  getRoleByID(roleId: number): Role;
  getAllRole(): Role[]; 
  getUserPresenter(): UserPresenter;
  getAllUser(): User[];
}

export class FakeMMUserFacade implements UserFacade {
  constructor(
    private auth: UserAuthorizationService,
    private notify: NotificationService,
    private roleService: RoleService,
    private userRepository: UserRepository,
    private userPresenter: UserPresenter,
  ) {}
  async send(userId: number, subject: string, text: string): Promise<boolean> {
    return await this.notify.send(userId, subject, text);
  }
  async upgradeTrainee(userId: number): Promise<void> {
    return await this.auth.upgradeTrainee(userId);
  }

  checkUserWithThrow(userId: number, access: AccessItem): void {
    return this.roleService.checkUserWithThrow(userId, access);
  }

  getRoleByID(roleId: number): Role {
    return this.roleService.getOne(roleId);
  }

  getAllRole(): Role[] {
    return this.roleService.getAll();
  }
  
  getUserByID(userId: number): User {
    return this.userRepository.getOne(userId);
  }

  getUserPresenter(): UserPresenter {
    return this.userPresenter;
  }

  getAllUser() {
    return this.userRepository.getAll();
  }
}
