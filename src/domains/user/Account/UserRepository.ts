import {
  User, 
  UserAuthenticationDTO,
  UserDAO,
  UserRepository,
} from "..";
import { DataAccessService } from "../../../utilites";
import { AnyUserSpecification } from "./AnyUserSpecification";
import { UserFinderError } from "../Error";

export class FakeMMUserRepository implements UserRepository {
  private index = new Map<number, User>();
  private indexPrevState = new Map<number, UserDAO>();
  private indexRole = new Map<number, Map<number, User>>();
  private indexLogin = new Map<string, User>();

  private table = "Users";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<User[]>(this.table); 
    cache?.forEach((r) => {
      this.addIndexes(r);
    });
    console.log("[*]",this.table, "INIT", cache.length);
  }

  private addIndexes(u: User) {
    this.index.set(u.getId(), u);
    this.updateOldState(u);
    this.indexLogin.set(u.getLogin(), u);
    this.addIndexRole(u.getRole(), u);
  }

  private addIndexRole(role: number,u: User) { 
    if (!this.indexRole.has(role))
      this.indexRole.set(role, new Map<number, User>());
    this.indexRole.get(role)!.set(u.getId(), u);
  }
  private removeIndex(u: User) {
    this.index.delete(u.getId());
    this.indexLogin.delete(u.getLogin());
    this.indexRole.get(u.getRole())?.delete(u.getId());
  }

  async save(user: User): Promise<boolean> {
    this.loginChangeHandler(user); 
    this.roleChangeHandler(user);
    this.updateOldState(user);
    return await this.dataAccessService.updateEntity(
      this.table,
      user.getId(),
      user.toJSON()
    );
  }

  //#region handers change detections

  private roleChangeHandler(u: User  ) {
    const role = u.getRole();
    const oldRole = this.getOldState(u)?.role;
    if(role === oldRole) return;
    if(oldRole) this.indexRole.get(oldRole)?.delete(u.getId());
    if (role) this.addIndexRole(role, u);
  }
  private loginChangeHandler(u: User  ) {
    const login = u.getLogin();
    const oldlogin = this.getOldState(u)?.login;
    if(login === oldlogin) return;
    if(oldlogin) this.indexLogin.delete(oldlogin);
    if (login) this.indexLogin.set(login, u);
  } 
  private getOldState(article: User) {
    return this.indexPrevState.get(article.getId());
  }
  private updateOldState(article: User) {
    this.indexPrevState.set(article.getId(), article.toJSON());
  }

  //#endregion
  
  async create(data: UserAuthenticationDTO): Promise<User> {
    const user = await this.dataAccessService.createEntity<User>(
      this.table,
      Object.assign(
        {
          role: 1,
          firstName: "Новый пользователь",
          secondName: "",
          lastName: "",
          updateAt: +new Date(),
          createAt: +new Date(),
        },
        data
      )
    );
    this.addIndexes(user);
    return user;
  }

  async delete(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    const result = await this.dataAccessService.deleteEntity(this.table, id);
    if (result && user) this.removeIndex(user);
    return result;
  }
  async findAll(): Promise<User[]> {
    return await this.dataAccessService.select(this.table);
  }

  getAll(): User[] {
    return Array.from(this.index.values());
  }

  async findOne(id: number): Promise<User> {
    return await this.dataAccessService.select(this.table, id);
  }

  getOne(id: number): User {
    if (!this.index.has(id)) throw new UserFinderError("Нет пользователя");
    return this.index.get(id)!;
  }

  async findBySpecification(request: AnyUserSpecification): Promise<User[]> {
    return await this.dataAccessService.request(this.table, request.build());
  }

  getBySpecification(request: AnyUserSpecification): User[] {
    return this.getAll().filter(request.buildStrategy());
  }

  async findByRole(roleId: number): Promise<User[]> {
    let specification = new AnyUserSpecification().where("role").equal(roleId);
    return await this.findBySpecification(specification);
  }

  getByRole(roleId: number): User[] {
    return Array.from(this.indexRole.get(roleId)?.values() ?? []);
  }

  getByLogin(login: string): User {
    if (!this.indexLogin.has(login))
      throw new UserFinderError("Нет пользователя");
    return this.indexLogin.get(login)!;
  }
  
  hasUserByLogin(login: string): boolean {
    return this.indexLogin.has(login);
  }
}
