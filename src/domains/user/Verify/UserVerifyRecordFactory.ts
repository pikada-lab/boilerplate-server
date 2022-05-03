import { UserVerifyRecord, UserVerifyRecordDAO } from "./UserVerifyRecord";

export const UserVerifyRecordFactory = (dao: UserVerifyRecordDAO): any => {
  return new UserVerifyRecord().restore(dao);
};
