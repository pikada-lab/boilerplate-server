import { BaseHistory } from "./History"
import { History } from "..";

export const HistoryFactory = (ref: History) => {
  return new BaseHistory().restore(ref);
}