import { UserContactDTO } from ".";
import { BaseUserContact } from "./UserContact";

export const contactFactory = (contactDTO: UserContactDTO): any => {
  const contact = BaseUserContact.create(contactDTO);
  return contact;
};
