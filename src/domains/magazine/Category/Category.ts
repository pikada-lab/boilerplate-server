export type CategoryStatus = "CREATED" | "PUBLISH"
export interface CategoryLike {
  id: number;
  name: string;
  about: string; 
  orderIndex: number;
  status: CategoryStatus;
}

export interface CategoryAbout {
  name: string;
  about: string; 
}


export class Category {
  private id!: number;
  private name: string = "";
  private about: string = ""; 
  private orderIndex: number = 0;
  private status: CategoryStatus = "CREATED";

  static create(cat: CategoryAbout) {
    return new Category().restore(
      Object.assign(
        cat, 
        {
          id: -1,
          status: "CREATED" as CategoryStatus,
          orderIndex: 0,
        }
      ) 
    );
  }

  getId() {
    return this.id;
  }
  //#region command

  edit(name: string, about: string) {
    this.name = name;
    this.about = about;
  }

  publish() {
    if(!this.name) throw new Error("Нельзя опубликовать");
    if(!this.about) throw new Error("Нельзя опубликовать");
    this.status = "PUBLISH";
  }

  unpublish() { 
    this.status = "CREATED";
  }

  setOrder(index: number) {
    this.orderIndex = index;
  }

  //#endregion

  restore(cat: CategoryLike) {
    this.id = cat.id;
    this.name = cat.name;
    this.about = cat.about; 
    this.orderIndex = cat.orderIndex;
    this.status = cat.status;
    return this;
  }

  toJSON(): CategoryLike {
    return  {
      id: this.id,
      name: this.name,
      about: this.about,
      status: this.status,
      orderIndex: this.orderIndex,
    }
  }
}