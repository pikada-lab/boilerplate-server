import { UserRepository } from "..";
import { AccessItem, RoleDAO } from "./Role";
import { RoleRepository } from "./RoleRepository";

export class RoleService {
  constructor(
    private userRepository: UserRepository,
    private repository: RoleRepository
  ) {}

  async init() {
    if (!this.repository.getAll()?.length) {
      const rights = [
        {
          id: 1,
          name: "Читатель",
          comment: "Может собирать понравившиеся статьи в коллекции.",
          right: [AccessItem.CAN_SEE_ARTICLE, AccessItem.CAN_SEE_TEST],
        },
        {
          id: 2,
          name: "Стажёр",
          comment:
            "Проходит стажировку в журнале, должен выполнять задачи согласно плана стажировки.",
          right: [
            AccessItem.CAN_SEE_ARTICLE,
            AccessItem.CAN_SEE_TASKS,
            AccessItem.CAN_SEE_PHOTO,
            AccessItem.CAN_CREATE_ARTICLE,
            AccessItem.CAN_HAVE_TASK
          ],
        },
        {
          id: 3,
          name: "Журналист",
          comment:
            "Пишет статьи по редакционному заданию, может посещать редколлегии и предлагать материалы",
          right: [
            AccessItem.CAN_SEE_ARTICLE,
            AccessItem.CAN_SEE_TASKS,
            AccessItem.CAN_SEE_PHOTO,
            AccessItem.CAN_SEE_FEE,
            AccessItem.CAN_SEE_ANALITYCS,
            AccessItem.CAN_CREATE_ARTICLE,
            AccessItem.CAN_HAVE_TASK
          ],
        },
        {
          id: 4,
          name: "Ньюсмейкер",
          comment:
            "Пишет новости по пресс релизам или собирает материалы из открытых источников",
          right: [
            AccessItem.CAN_SEE_ARTICLE,
            AccessItem.CAN_SEE_TASKS,
            AccessItem.CAN_SEE_PHOTO,
            AccessItem.CAN_SEE_FEE,
            AccessItem.CAN_SEE_ANALITYCS,
            AccessItem.CAN_CREATE_ARTICLE,
            AccessItem.CAN_HAVE_TASK
          ],
        },
        {
          id: 5,
          name: "PR менеджер",
          comment:
            "Размещает статьи и новости своей группы или своего артиста.",
          right: [
            AccessItem.CAN_SEE_ARTICLE,
            AccessItem.CAN_SEE_TASKS,
            AccessItem.CAN_SEE_PHOTO,
            AccessItem.CAN_SEE_ANALITYCS,
            AccessItem.CAN_SEE_ANALITYCS_PHOTO,
            AccessItem.CAN_CREATE_ARTICLE,
            AccessItem.CAN_CREATE_TASK
          ],
        },
        {
          id: 6,
          name: "Редактор",
          comment:
            "Принимает статьи, отвечает за их своевременную публикацию, создаёт редакционные задачи",
          right: [
            AccessItem.CAN_SEE_ARTICLE,
            AccessItem.CAN_SEE_TASKS,
            AccessItem.CAN_SEE_PHOTO,
            AccessItem.CAN_SEE_ANALITYCS,
            AccessItem.CAN_SEE_ANALITYCS_PHOTO,
            AccessItem.CAN_SEE_USERS,
            AccessItem.CAN_SEE_FEE_REPORTS,
            AccessItem.CAN_CREATE_ARTICLE,
            AccessItem.CAN_BE_EDITOR_IN_TASK,
            AccessItem.CAN_CREATE_TASK,
            AccessItem.CAN_HAVE_TASK,
            AccessItem.CAN_PUT_AUTHOR_IN_TASK
          ],
        },
        {
          id: 7,
          name: "Администратор",
          comment:
            "Администрирует сотрудников журнала, выдаёт права, может блокировать и удалять любых пользователей",
          right: [
            AccessItem.CAN_SEE_ARTICLE,
            AccessItem.CAN_SEE_TASKS,
            AccessItem.CAN_SEE_PHOTO,
            AccessItem.CAN_SEE_ANALITYCS,
            AccessItem.CAN_SEE_ANALITYCS_PHOTO,
            AccessItem.CAN_SEE_USERS,
            AccessItem.CAN_SEE_TEST,
            AccessItem.CAN_SEE_FEE,
            AccessItem.CAN_SEE_FEE_REPORTS,
            AccessItem.CAN_CREATE_ARTICLE,
            AccessItem.CAN_BE_EDITOR_IN_TASK,
            AccessItem.CAN_CHANGE_ROLE,
            AccessItem.CAN_CREATE_TASK,
            AccessItem.CAN_HAVE_TASK,
            AccessItem.CAN_PUT_AUTHOR_IN_TASK,
            AccessItem.CAN_PUT_EDITOR_IN_TASK,
            AccessItem.CAN_PAY_FEE
          ],
        },
      ] as RoleDAO[];
      for (let right of rights) {
        await this.repository.create(right);
      }
    }
  }

  checkUserWithThrow(userId: number, access: AccessItem) {
    const user = this.userRepository.getOne(userId);
    if(user.getId() === 1) return;
    const roleId = user.getRole();
    const role = this.repository.getOne(roleId);
    role.checkWithThrow(access);
  }
  
  checkUser(userId: number, access: AccessItem) {
    const user = this.userRepository.getOne(userId);
    if(user.getId() === 1) return true;
    const roleId = user.getRole();
    const role = this.repository.getOne(roleId);
    return role.checkAccess(access);
  }

  getOne(roleId: number) {
    return this.repository.getOne(roleId);
  }

  getAll() {
    return this.repository.getAll();
  }
}
