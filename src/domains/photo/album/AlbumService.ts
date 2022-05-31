import { AccessItem } from "../../user/Role/Role";
import { UserFacade } from "../../user/UserFacade";
import { AlbumMetadata } from "./Album";
import { AlbumRepository } from "./AlbumRepository";

export class AlbumService {
  constructor(
    private repository: AlbumRepository,
    private access: UserFacade
  ) {}

  async init() {}

  async create(initiator: number, meta: AlbumMetadata) {
    this.access.checkUserWithThrow(initiator, AccessItem.CAN_EDIT_ALBUM);
    const cdo = Object.assign(meta, { userId: initiator });
    return await this.repository.create(cdo);
  }

  async edit(id: number, initiator: number, meta: AlbumMetadata) {
    this.access.checkUserWithThrow(initiator, AccessItem.CAN_EDIT_ALBUM);
    const album = this.repository.getOne(id);
    if (!album.isOwner(initiator)) throw new Error("You are not owner");
    album.setMetadata(meta);
    this.repository.save(album);
    return album;
  }

  async setOwner(id: number, initiator: number, owner: number) {
    this.access.checkUserWithThrow(initiator, AccessItem.CAN_EDIT_ALBUM);
    const album = this.repository.getOne(id);
    album.setOwner(owner);
    await this.repository.save(album);
    return album;
  }

  async delete(id: number, initiator: number) {
    this.access.checkUserWithThrow(initiator, AccessItem.CAN_EDIT_ALBUM);
    const album = this.repository.getOne(id);
    if (!album.isOwner(initiator)) throw new Error("You are not owner");
    if (album.isFulled())
      throw new Error("You can't delete the album with photos");
    return await this.repository.delete(id);
  }

  async bun(id: number, initiator: number) {
    this.access.checkUserWithThrow(initiator, AccessItem.CAN_EDIT_ALBUM);
    const album = this.repository.getOne(id);
    if (album.isBanned()) throw new Error("Album is already banned");
    album.ban();
    await this.repository.save(album);
    return album;
  }

  async unban(id: number, initiator: number) {
    this.access.checkUserWithThrow(initiator, AccessItem.CAN_EDIT_ALBUM);
    const album = this.repository.getOne(id);
    if (album.isNotBanned()) throw new Error("Album is already created");
    album.unban();
    await this.repository.save(album);
    return album;
  }

  getAlbum(id: number) {
    return this.repository.getOne(id);
  }
}
