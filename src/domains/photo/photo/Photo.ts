export interface MetaDescriptionsPhoto {
  name?: string;
  about?: string;

  photographer?: string;
  photographerLink?: string;

  source?: string;
  sourceLink?: string;
}
export interface ArticlePhoto extends MetaDescriptionsPhoto {
  id?: number;
  url?: string;

  orderIndex?: number;
  albumId?: number;
  userId?: number;
  createAt?: number;
  status?: PhotoStatusType;
}

export type PhotoStatusType = "PENDING_CREATE" | "CREATED" | "BANNED";

export class Photo { 
  private id?: number;
  private name?: string;
  private about?: string;
  private url?: string;

  private photographer?: string;
  private photographerLink?: string;

  private source?: string;
  private sourceLink?: string;

  private orderIndex = 0;

  private albumId?: number;
  private userId?: number;

  private createAt?: number;
  private status: PhotoStatusType = "PENDING_CREATE";
  constructor() {}

  static create(photo: ArticlePhoto) {
    return new Photo().restore(Object.assign(photo, { createAt: Date.now() }));
  }

  getId() {
    return this.id!;
  }

  getUser() {
    return this.userId;
  }

  getAlbum() {
    return this.albumId;
  }
  getSort() {
    return this.orderIndex;
  }

  isBanned() {
    return this.status === "BANNED";
  }

  isNotBanned() {
    return this.status !== "BANNED";
  }
  isAlbum(albumId: number) {
    return this.albumId && this.albumId === albumId;
  }

  getURL() {
    return this.url;
  }

  //#region command
  canBan() {
    return this.isNotBanned();
  }
  ban() {
    if (!this.canBan()) throw new Error("Forbidden");
    this.status = "BANNED";
    return this;
  }

  canUnban() {
    return this.isBanned();
  }

  unban() {
    if (!this.canUnban()) throw Error("Forbidden");
    this.status = "CREATED";
    return this;
  }

  setOrderIndex(index: number) {
    this.orderIndex = index;
    return this;
  }

  setMetadata(dto: MetaDescriptionsPhoto) {
    this.about = dto.about ?? this.about;
    this.name = dto.name ?? this.name;
    this.photographer = dto.photographer ?? this.photographer;
    this.photographerLink = dto.photographerLink ?? this.photographerLink;
    this.source = dto.source ?? this.source;
    this.sourceLink = dto.sourceLink ?? this.sourceLink;
    return this;
  }

  setURL(url: string) {
    if (this.status != "PENDING_CREATE") throw new Error("Photo already has url");
    this.url = url;
    this.status = "CREATED";
    return this;
  }
  setSort(index: number) {
    this.orderIndex = index;
  }

  setAlbum(albumId?: number) {
    this.albumId = albumId;
  }
  //#endregion

  restore(dao: ArticlePhoto) {
    this.id = dao.id;
    this.name = dao.name;
    this.about = dao.about;
    this.url = dao.url;
    this.photographer = dao.photographer;
    this.photographerLink = dao.photographerLink;
    this.source = dao.source;
    this.sourceLink = dao.sourceLink;
    this.orderIndex = dao.orderIndex ?? 0;
    this.albumId = dao.albumId;
    this.userId = dao.userId;
    this.createAt = dao.createAt;
    this.status = dao.status ?? "PENDING_CREATE";
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      about: this.about,
      url: this.url,
      photographer: this.photographer,
      photographerLink: this.photographerLink,
      source: this.source,
      sourceLink: this.sourceLink,
      orderIndex: this.orderIndex,
      albumId: this.albumId,
      userId: this.userId,
      createAt: this.createAt,
      status: this.status,
    };
  }
}
