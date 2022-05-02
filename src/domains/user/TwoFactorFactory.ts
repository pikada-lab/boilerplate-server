import { TwoFactorFactoryDAO } from "./TwoFactorFactoryDAO";
import { TwoFactorSecrets } from "./TwoFactorSecrets"; 

export const TwoFactorFactory = (dao: TwoFactorFactoryDAO): any => {
  return new TwoFactorSecrets().restore(dao);
};
