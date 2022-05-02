import { User, UserDAO } from ".";
import { ContactsRepository } from "./ContactsRepository";
import { FakeMMUser } from "./User";

export const userFactory = (contactRepository: ContactsRepository) => {
  return (userDAO: UserDAO): any => {
    const user = new FakeMMUser();
    user.restore(userDAO);
    if(user.getId() === 1) {
      user.setRole(7);
    }
    const contacts = contactRepository.getByUserId(user.getId());
    user.setContactList(contacts);
    return user;
  };
};
