import { User, UserDAO } from ".";
import { FakeMMUser } from "./User";

export const userFactory =  (userDAO: UserDAO): any => {
    const user = new FakeMMUser();
    user.restore(userDAO);
    return user;
}