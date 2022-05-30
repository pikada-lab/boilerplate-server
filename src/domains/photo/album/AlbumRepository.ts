import { DataAccessService } from "../../../utilites";
import { Album, AlbumCDO, AlbumDAO } from "./Album";
export interface AlbumExportRepository {
  getByUser(id: number): Album[];
  getAll(): Album[]; 
  getOne(id: number): Album;
}
export class AlbumRepository implements AlbumExportRepository {
  private index = new Map<number, Album>();
  private indexPrevState = new Map<number, AlbumDAO>();
  private indexUser = new Map<number, Album[]>();
  private table = "Album";

  constructor(private dataAccessService: DataAccessService) {}

  //#region Command

  async init() {
    const cache = await this.dataAccessService.select<Album[]>(this.table);
    cache?.forEach((ref) => {
      this.addIndexes(ref);
    });
  }

  async create(album: AlbumCDO): Promise<Album> {
    const albumRef = await this.dataAccessService.createEntity<Album>(this.table, Album.create(album));
    this.addIndexes(albumRef);
    return albumRef;
  }

  async save(album: Album): Promise<boolean> {
    const res = await this.dataAccessService.updateEntity(this.table, album.getId()!, album.toJSON());
    if (!res) return false;
    this.userChangeHandler(album);
    return true;
  }

  async delete(id: number): Promise<boolean> {
    const album = this.getOne(id);
    if (!album) {
      return false;
    }
    this.removeIndex(album);
    await this.dataAccessService.deleteEntity(this.table, id);
    return true;
  }
  //#endregion

  //#region Index control
  private addIndexes(album: Album) {
    this.indexPrevState.set(album.getId()!, album.toJSON());
    this.index.set(album.getId()!, album);
    this.addIndexUser(album.getOwner(), album);
  }
  private removeIndex(photo: Album) {
    this.indexPrevState.delete(photo.getId()!);
    this.index.delete(photo.getId());
    this.removeIndexUser(photo.getId(), photo.getOwner());
  }

  //#region User owner
  private userChangeHandler(album: Album) {
    const user = album.getOwner();
    const olduser = this.indexPrevState.get(album.getId())!.userId;
    if (user === olduser) return;
    this.removeIndexUser(album.getId(), olduser);
    this.addIndexUser(user, album);
  }

  private addIndexUser(newuser: number | undefined, album: Album) {
    if (!newuser) return;
    if (!this.indexUser.has(newuser)) this.indexUser.set(newuser, []);
    this.indexUser.get(newuser)?.push(album);
  }

  private removeIndexUser(id: number, olduser?: number) {
    if (!olduser) return;
    const index = this.indexUser.get(olduser)!.findIndex((f) => f.getId() === id);
    if (~index) {
      this.indexUser.get(olduser)!.splice(index, 1);
    }
  }
  //#endregion

  //#endregion

  //#region Query

  getByUser(id: number) {
    return this.indexUser.get(id) ?? [];
  }

  getAll() {
    return Array.from(this.index.values());
  }

  getOne(id: number) {
    const photo = this.index.get(id);
    if (!photo) throw new Error("Нет фотографии с таким номером");
    return photo;
  }
  //#endregion
}
