import { User, UserDTO, UserRepository } from ".";
import { RoleService } from "./Role/RoleService"; 
export class UserPresenter {
  constructor(private userRepository: UserRepository, private userRole: RoleService) {}

  forAll(user: User) {
    return {
      ...user.getUserDetail(),
      roleRef: this.userRole.getOne(user.getRole()),
    };
  }

  mapForAll(user: User[]) {
    return user.map((r) => this.forAll(r));
  }

  getUserTumbanian(u: number): ClientUserTumbanian {
    const user = this.userRepository.getOne(u);
    const role = this.userRole.getOne(user.getRole());
    return new ClientUserTumbanian().restore(user.toJSON(), role.name);
  }
}

export class ClientUserTumbanian {
  id!: number;
  firstName!: string;
  lastName!: string;
  roleName!: string;

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  restore(user: UserDTO, roleName: string) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.roleName = roleName;
    return this;
  }
}