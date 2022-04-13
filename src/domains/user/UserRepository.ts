import { User, UserAuthentication, UserAuthenticationDTO, UserRepository } from ".";
import { DataAccessService } from "../../utilites";
import { AnyUserSpecification } from "./AnyUserSpecification";
import { UserFinderError } from "./Error";

export class FakeMMUserRepository implements UserRepository {
  private index = new Map<number, User>();
  private indexRole = new Map<number, Map<number, User>>();
  private indexLogin = new Map<string, User>();

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<User[]>("User");
    cache.forEach((r) => {
      this.addIndexes(r);
    });
  }

  private addIndexes(u: User) {
    this.index.set(u.getId(), u);
    this.indexLogin.set(u.getLogin(), u);

    if (!this.indexRole.has(u.getRole()))
      this.indexRole.set(u.getRole(), new Map<number, User>());
    this.indexRole.get(u.getRole())!.set(u.getId(), u);
  }
  private removeIndex(u: User) {
    this.index.delete(u.getId());
    this.indexLogin.delete(u.getLogin());
    this.indexRole.get(u.getRole())?.delete(u.getId());
  }

  async save(user: User): Promise<boolean> {
    return await this.dataAccessService.updateEntity(
      "User",
      user.getId(),
      user.toJSON()
    );
  }
  async create(data: UserAuthenticationDTO): Promise<User> {
    const user = await this.dataAccessService.createEntity<User>(
      "User",
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
    const result = await this.dataAccessService.deleteEntity("User", id);
    if (result && user) this.removeIndex(user);
    return result;
  }
  async findAll(): Promise<User[]> {
    return await this.dataAccessService.select("User");
  }

  getAll(): User[] {
    return Array.from(this.index.values());
  }

  async findOne(id: number): Promise<User> {
    return await this.dataAccessService.select("User", id);
  }

  getOne(id: number): User  {
    if(!this.index.has(id)) throw new UserFinderError("Нет пользователя");
    return this.index.get(id)!;
  }

  async findBySpecification(request: AnyUserSpecification): Promise<User[]> {
    return await this.dataAccessService.request("User", request.build());
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
    if(!this.indexLogin.has(login))  throw new UserFinderError("Нет пользователя");
    return this.indexLogin.get(login)!;
  }
}
