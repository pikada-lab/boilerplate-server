import { UserRepository } from "..";
import { AccessItem, RoleDAO } from "./Role";
import { RoleRepository } from "./RoleRepository";

export class RoleService {
  constructor(
    private userRepository: UserRepository,
    private repository: RoleRepository
  ) {}

  async init() {
    if (this.repository.getAll()) {
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
            AccessItem.CAN_CREATE_ARTICLE
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
            AccessItem.CAN_SEE_ANALITYCS,,
            AccessItem.CAN_CREATE_ARTICLE
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
            AccessItem.CAN_CREATE_ARTICLE
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
            AccessItem.CAN_SEE_FEE_REPORTS,
            AccessItem.CAN_CREATE_ARTICLE
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
    const roleId = user.getRole();
    const role = this.repository.getOne(roleId);
    role.checkWithThrow(access);
  }
  
  checkUser(userId: number, access: AccessItem) {
    const user = this.userRepository.getOne(userId);
    const roleId = user.getRole();
    const role = this.repository.getOne(roleId);
    return role.checkAccess(access);
  }
}
