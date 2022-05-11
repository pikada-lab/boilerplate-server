import { BaseTaskHistory } from "./History"
import { TaskHistory } from "../..";

export const HistoryFactory = (ref: TaskHistory) => {
  return new BaseTaskHistory().restore(ref);
}