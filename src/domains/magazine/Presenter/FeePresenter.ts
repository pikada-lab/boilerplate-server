import { Fee } from "..";
import { TaskFee } from "../Fee/Fee";

export class FeePresenter {
  constructor() {

  }

  full(fee: TaskFee) {
    return fee.toJSON();
  }

  mapFull(fee: TaskFee[]) {
    return fee.map(r => this.full(r));
  }
}