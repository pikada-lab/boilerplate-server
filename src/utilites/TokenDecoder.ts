import { ConfigService } from "./ConfigService";
import * as jose from "jose";

export const TokenDecoder = async (token: string,  config: ConfigService): Promise<any> => {
    const { payload, protectedHeader } = await jose.jwtVerify(
      token,
      config.privateKey
    );
    return payload;
  }