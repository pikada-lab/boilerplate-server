import { Fee } from "..";
import { TaskFee } from "./Fee";

export const FeeFactory = (fee: Fee) => {
  return new TaskFee().restore(fee);
};
