import {
  User,
  UserContact,
  UserContactDTO,
  UserDTO,
  UserRepository,
  UserSettingDTO, 
} from ".";
import { ContactsRepository } from "./Contact/ContactsRepository";
import { UserSettingService } from "./services";

export class FakeMMUserSettingService implements UserSettingService {
  constructor(
    private repository: UserRepository,
    private contactsRepository: ContactsRepository
  ) {} 
  async init() {
    // TODO create first user
  }

  async getFullDetailsUser(userId: number): Promise<UserDTO> {
    const user = this.repository.getOne(userId);
    return user.getUserDetail();
  }

  async saveSetting(userId: number, dto: UserSettingDTO): Promise<User> {
    const user = this.repository.getOne(userId);
    user.setSetting(dto);
    await this.repository.save(user);
    return user;
  }

  async addContact(userId: number, contactDTO: UserContactDTO): Promise<UserContact> {
    this.checkRule(userId, +contactDTO.userId);
    const contact = await this.contactsRepository.create(contactDTO);
    const user = this.repository.getOne(userId);
    user.addContact(contact);
    this.repository.save(user);
    return contact;
  }
  
  async deleteContact(userId: number, contactId: number): Promise<boolean> {
    const contact = this.contactsRepository.getOne(contactId);
    this.checkRule(userId, contact.getUserId());
    await this.contactsRepository.delete(contactId);
    const user = this.repository.getOne(userId);
    user.removeContact(contactId);
    this.repository.save(user);
    return true;
  }

  async editContact(userId: number, contactDTO: UserContactDTO): Promise<UserContact> {
    this.checkRule(userId, +contactDTO.userId);
    const contact = await this.contactsRepository.getOne(contactDTO.id);
    contact.restore(contactDTO);
    this.contactsRepository.save(contact);  
    return contact;
  }
  private checkRule(userId: number, changeUserId: number) {
    const user = this.repository.getOne(userId);
    if(changeUserId !== userId) {
      if(![4,5,6].includes(user.getRole())) throw new Error("Нет прав на изменение контакта");
    }
  }
}
