import { AccessError } from "../Error";

export enum AccessItem {
  CAN_SEE_USERS = 1,
  CAN_SEE_TASKS,
  CAN_SEE_ARTICLE,
  CAN_SEE_FEE,
  CAN_SEE_ANALITYCS,
  CAN_SEE_PHOTO,
  CAN_SEE_FEE_REPORTS,
  CAN_SEE_ANALITYCS_PHOTO,
  CAN_SEE_TEST,
  CAN_CREATE_ARTICLE,
  CAN_CREATE_TASK,
  CAN_HAVE_TASK,
  CAN_BE_EDITOR_IN_TASK,
  CAN_PUT_AUTHOR_IN_TASK,
  CAN_PUT_EDITOR_IN_TASK,
  CAN_PUBLISH_ARTICLE,
  CAN_CHANGE_ROLE,
  CAN_PAY_FEE
}

export interface RoleDAO {
    id: number;
    name: string;
    comment: string;
    right: AccessItem[];
}

export class Role { 
  id?: number;
  name!: string;
  comment!: string;
  right: Set<AccessItem> = new Set();

  constructor() {}

  checkAccess(access: AccessItem) {
    return this.right.has(access);
  }
  checkWithThrow(access: AccessItem) {
    if (this.checkAccess(access)) return;
    throw new AccessError("Permission denie, access: " + access);
  }
  setAccess(access: AccessItem) {
    this.right.add(access);
  }

  getId(): number {
    return this.id!;
}
  restore(role: RoleDAO) {
    this.id = role.id;
    this.name = role.name;
    this.comment = role.comment;
    this.right = new Set(role.right ?? []);

    return this;
  }

  toJSON(): RoleDAO {
    return {
      id: this.id!,
      name: this.name,
      comment: this.comment,
      right: Array.from(this.right.values()),
    };
  }
}
