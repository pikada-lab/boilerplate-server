import { DataAccessService } from "../../../utilites";
import { ArticlePhoto, Photo } from "./Photo";
export interface PhotoReposioryExport {
  getByAlbum(id: number) : Photo[]; 
  getByUser(id: number)  : Photo[]; 
  getAll(): Photo[]; 
  getOne(id: number): Photo;
}
export class PhotoReposiory implements PhotoReposioryExport {
  private index = new Map<number, Photo>();
  private indexPrevState = new Map<number, ArticlePhoto>();
  private indexAlbum = new Map<number, Photo[]>();
  private indexUser = new Map<number, Photo[]>();
  private table = "Photo";

  constructor(private dataAccessService: DataAccessService) {}

  //#region Command

  async init() {
    const cache = await this.dataAccessService.select<Photo[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r);
    });
  }

  async create(task: ArticlePhoto): Promise<Photo> {
    const hisotory = await this.dataAccessService.createEntity<Photo>(this.table, Photo.create(task));
    this.addIndexes(hisotory);
    return hisotory;
  }

  async save(photo: Photo): Promise<boolean> {
    const res = await this.dataAccessService.updateEntity(this.table, photo.getId()!, photo.toJSON());
    if (!res) return false;
    this.albumChangeHandler(photo);
    this.userChangeHandler(photo);
    return true;
  }

  async delete(id: number): Promise<boolean> {
    const photo = this.getOne(id);
    if (!photo) {
      return false;
    }
    this.removeIndex(photo);
    await this.dataAccessService.deleteEntity(this.table, id);
    return true;
  }
  //#endregion

  //#region Index control
  private addIndexes(photo: Photo) {
    this.indexPrevState.set(photo.getId()!, photo.toJSON());
    this.index.set(photo.getId()!, photo);
    this.addIndexAlbum(photo.getAlbum(), photo);
    this.addIndexUser(photo.getUser(), photo);
  }
  private removeIndex(photo: Photo) {
    this.indexPrevState.delete(photo.getId()!);
    this.index.delete(photo.getId());
    this.removeIndexAlbum(photo.getId(), photo.getAlbum());
    this.removeIndexUser(photo.getId(), photo.getUser());
  }

  //#region Album owner
  private albumChangeHandler(photo: Photo) {
    const album = photo.getAlbum();
    const oldalbum = this.indexPrevState.get(photo.getId())!.albumId;
    if (album === oldalbum) return;
    this.removeIndexAlbum(photo.getId(), oldalbum);
    this.addIndexAlbum(album, photo);
  }

  private addIndexAlbum(newalbum: number | undefined, photo: Photo) {
    if (!newalbum) return;
    if (!this.indexAlbum.has(newalbum)) this.indexAlbum.set(newalbum, []);
    this.indexAlbum.get(newalbum)?.push(photo);
  }

  private removeIndexAlbum(id: number, oldalbum?: number) {
    if (!oldalbum) return;
    const index = this.indexAlbum.get(oldalbum)!.findIndex((f) => f.getId() === id);
    if (~index) {
      this.indexAlbum.get(oldalbum)!.splice(index, 1);
    }
  }
  //#endregion

  //#region User owner
  private userChangeHandler(photo: Photo) {
    const user = photo.getUser();
    const olduser = this.indexPrevState.get(photo.getId())!.userId;
    if (user === olduser) return;
    this.removeIndexUser(photo.getId(), olduser);
    this.addIndexUser(user, photo);
  }

  private addIndexUser(newuser: number | undefined, photo: Photo) {
    if (!newuser) return;
    if (!this.indexUser.has(newuser)) this.indexUser.set(newuser, []);
    this.indexUser.get(newuser)?.push(photo);
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
  getByAlbum(id: number) {
    return this.indexAlbum.get(id) ?? [];
  }

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
