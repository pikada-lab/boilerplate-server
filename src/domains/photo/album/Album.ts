export type AlbumStatusType = "CREATED" | "FULLED";
export interface AlbumDAO {
  id: number;
  name: string;
  about: string;

  defaultPhotographer?: string;
  defaultPhotographerLink?: string;

  source?: string;
  sourceLink?: string;

  userId: number;
  status: AlbumStatusType;
  createAt: Date;
  banned: boolean;
}

export interface AlbumMetadata {
  name?: string;
  about?: string;

  defaultPhotographer?: string;
  defaultPhotographerLink?: string;

  source?: string;
  sourceLink?: string;
}

export interface AlbumCDO extends AlbumMetadata {
  userId: number;
}

export class Album {
 
  id!: number;
  name!: string;
  about!: string;

  defaultPhotographer?: string;
  defaultPhotographerLink?: string;

  source?: string;
  sourceLink?: string;

  userId!: number;

  banned = false;
  status: AlbumStatusType = "CREATED";
  createAt: Date = new Date();

  constructor() {}

  static create(cdo: AlbumCDO) {
    return new Album().setOwner(cdo.userId).setMetadata(cdo);
  }

  setFull() {
    this.status = "FULLED";
    return this;
  }

  setEmpty() {
    this.status = "CREATED";
    return this;
  }

  isOwner(owner: number) {
    return this.userId === owner;
  }

  setOwner(userId: number) {
    this.userId = userId;
    return this;
  }

  setMetadata(meta: AlbumMetadata) {
    this.name = meta.name ?? "";
    this.about = meta.about ?? "";
    this.source = meta.source;
    this.sourceLink = meta.sourceLink;
    this.defaultPhotographer = meta.defaultPhotographer;
    this.defaultPhotographerLink = meta.defaultPhotographerLink;
    return this;
  }

  getId() {
    return this.id;
  }

  getOwner() {
    return this.userId;
  }

  isFulled() {
    return !this.isNotFulled();
  }

  isNotFulled() {
    return this.status === "CREATED";
  }

  isBanned() {
    return this.banned;
  }

  isNotBanned() {
    return !this.isBanned();
  }

  ban() {
    this.banned = true;
    return this;
  }

  unban() {
    this.banned = false;
    return this;
  }

  restore(obj: AlbumDAO) {
    this.id = obj.id;
    this.name = obj.name;
    this.about = obj.about;
    this.defaultPhotographer = obj.defaultPhotographer;
    this.defaultPhotographerLink = obj.defaultPhotographerLink;
    this.source = obj.source;
    this.sourceLink = obj.sourceLink;
    this.status = obj.status;
    this.userId = obj.userId;
    this.createAt = new Date(obj.createAt);
    this.banned = obj.banned;
    return this;
  }

  toJSON(): AlbumDAO {
    return {
      id: this.id,
      name: this.name,
      about: this.about,
      defaultPhotographer: this.defaultPhotographer,
      defaultPhotographerLink: this.defaultPhotographerLink,
      source: this.source,
      sourceLink: this.sourceLink,
      userId: this.userId,
      status: this.status,
      createAt: this.createAt,
      banned: this.banned,
    };
  }
}
