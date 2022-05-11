import { User } from ".";
import { UserFacade } from "./UserFacade";

export class UserPresenter {
  constructor(private facade: UserFacade) {}

  forAll(user: User) {
    return {
      ...user.getUserDetail(),
      roleRef: this.facade.getRoleByID(user.getRole()),
    };
  }

  mapForAll(user: User[]) {
    return user.map((r) => this.forAll(r));
  }
}
