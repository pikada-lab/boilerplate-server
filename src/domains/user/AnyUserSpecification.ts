import { User } from ".";

export class AnyUserSpecification {
  private specification: { field: string; operation: string; param: any }[] =
    [];
  private sqlSpecification: string[] = [];
  private stateField?: string;

  where(fieldName: string) {
    if (this.stateField)
      throw new Error("Спецификация ожидает значение (like,equal,in)");
    this.stateField = fieldName;
    return this;
  }

  like(params: string | number) {
    if (!this.stateField) throw new Error("Спецификация ожидает поле (where)");
    this.sqlSpecification.push(`${this.stateField} LIKE '%${params}%'`);
    this.specification.push({
      field: this.stateField!,
      operation: "like",
      param: new RegExp("(" + params + ")", "i"),
    });
    return this;
  }
  in(params: string[] | number[]) {
    if (!this.stateField) throw new Error("Спецификация ожидает поле (where)");
    if (!Array.isArray(params)) params = [params];
    this.sqlSpecification.push(
      `${this.stateField} IN ('${params.join("', '")}')`
    );
    this.specification.push({
      field: this.stateField!,
      operation: "in",
      param: params,
    });
    this.stateField = undefined;
    return this;
  }
  equal(params: string | number) {
    if (!this.stateField) throw new Error("Спецификация ожидает поле (where)");
    this.sqlSpecification.push(`${this.stateField} = '${params}'`);
    this.specification.push({
      field: this.stateField!,
      operation: "equal",
      param: params,
    });
    this.stateField = undefined;
    return this;
  }
  build() {
    return this.sqlSpecification.join(" AND ");
  }

  get and() {
      return this;
  }

  buildStrategy() {
    return (user: any) => {
      let object = user.toJSON() as any;
      c1: for (let i of this.specification) {
        let field = object[i.field];
        switch (i.operation) {
          case "like":
            if ((i.param as RegExp).test(field)) continue c1;
            return false;
          case "equal":
            if (i.param == field) continue c1;
            return false;
          case "in":
            for (let param of i.param) {
              if (param == field) continue c1;
            }
            return false;
          default:
            throw new Error("Операция неопознана");
        }
      }
      return true;
    };
  }
}
