import { UserContact, UserContactDTO, UserContactType } from ".";
import { UserDetailsError } from "./Error";

export abstract class BaseUserContact implements UserContact {
  protected value = "";
  protected title = "";
  protected type!: UserContactType;

  static create(contact: UserContactDTO) {
    if (contact.type === UserContactType.PHONE) {
      return new PhoneUserContact(contact.userId).restore(contact);
    }
    if (contact.type === UserContactType.EMAIL) {
      return new EmailUserContact(contact.userId).restore(contact);
    }
    if (contact.type === UserContactType.PROFILE) {
      return new ProfileUserContact(contact.userId).restore(contact);
    }
    if (contact.type === UserContactType.ADDRESS) {
      return new AddressUserContract(contact.userId).restore(contact);
    }
    throw new UserDetailsError("Тип контактов не поддерживается");
  }

  constructor(private userId: number) {}
  abstract restore(contact: UserContactDTO): UserContact;
  getTitle(): string {
    return this.title;
  }
  getContact(): string {
    return this.value;
  }
  getType(): UserContactType {
    return this.type;
  }
  toJSON(): UserContactDTO {
    return {
      userId: this.userId,
      title: this.title,
      type: this.type,
      value: this.value,
    };
  }
}

export class PhoneUserContact extends BaseUserContact {
  private validFormat = /^7(\d{10})$/;
  restore(contact: UserContactDTO): UserContact {
    this.value = this.phoneFormatter(contact.value);
    this.title = contact.title;
    this.type = UserContactType.PHONE;
    return this;
  }
  private phoneFormatter(dirtyPhone: string) {
    if (!dirtyPhone) throw new UserDetailsError("Нет телефона");
    if (typeof dirtyPhone !== "string")
      throw new UserDetailsError("Телефон должен быть строкой");
    const phone = dirtyPhone.trim().replace(/\D/g, "");
    if (!this.validFormat.test(phone))
      throw new UserDetailsError("Телефон имеет неправильный формат");
    return phone;
  }
}

export class EmailUserContact extends BaseUserContact {
  private validFormat = /^(\w)@([a-z_\-\.]{2,})\.([a-z]{2,})$/g;
  restore(contact: UserContactDTO): UserContact {
    this.value = this.mailFormatter(contact.value);
    this.title = contact.title;
    this.type = UserContactType.EMAIL;
    return this;
  }
  private mailFormatter(dirtyMail: string) {
    if (!dirtyMail) throw new UserDetailsError("Нет электронной почты");
    if (typeof dirtyMail !== "string")
      throw new UserDetailsError("Электронная почта должна быть строкой");
    const mail = dirtyMail.trim();
    if (!this.validFormat.test(mail))
      throw new UserDetailsError("Электронная почта имеет неверный формат");
    return mail;
  }
}

export class ProfileUserContact extends BaseUserContact {
  private validFormat = /^https:\/\/(.+)\.(.+)\/(.+)$/g;
  restore(contact: UserContactDTO): UserContact {
    this.value = this.profileFormatter(contact.value);
    this.title = contact.title;
    this.type = UserContactType.PROFILE;
    return this;
  }
  private profileFormatter(dirtyLink: string) {
    if (!dirtyLink) throw new UserDetailsError("Нет ссылки на профайл");
    if (typeof dirtyLink !== "string")
      throw new UserDetailsError("Ссылка на профайл должна быть строкой");
    const link = dirtyLink.trim();
    if (!this.validFormat.test(link))
      throw new UserDetailsError(
        "Ссылка на профайл должна быть абсолютной ссылкой"
      );
    return link;
  }
}
export class AddressUserContract extends BaseUserContact {
  restore(contact: UserContactDTO): UserContact {
    this.value = contact.value.trim();
    if (!this.value) throw new UserDetailsError("Нет адреса");
    this.title = contact.title;
    this.type = UserContactType.ADDRESS;
    return this;
  }
}
