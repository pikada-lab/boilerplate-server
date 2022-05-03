import fastify from "fastify";
import { FastifyInstance, FastifyRequest } from "fastify";
import { ConfigService } from "./ConfigService";
import { AuthenticationError, TwoFAError } from "../domains/user/Error";
import { TokenDecoder } from "./TokenDecoder";

export interface AuthHeaders {
  authorization: string;
}
export interface RestRequest {
  query: { [key: string]: string };
  params: { [key: string]: string };
  body: { [key: string]: string };
}

export interface RestAuthorizationRequest {
  payload: { id: number };
}

export class ServerController {
  private http!: FastifyInstance;
  constructor(private config: ConfigService) {}
  async init() {
    this.http = fastify();
    this.http.get("/ping", async (request, reply) => {
      return "pong";
    });
    this.http.register(require("fastify-cors"), {
      origin: "*",
      methods: ["POST, PATCH", "DELETE"],
    });
    // TODO, config PORT
    this.http.listen({ port: 8080 }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
    });
  }

  private async getPayload(req: FastifyRequest<{ Headers: AuthHeaders }>) {
    const auth = req.headers.authorization;
    if (!auth)
      throw new AuthenticationError(
        "Не удалось получить криптографическую подпись"
      );
    const token = auth.split(" ")[1];

    const payload = TokenDecoder(token, this.config);
    return payload;
  }

  getAuth(
    endpoint: string,
    callback: (
      req: RestRequest & RestAuthorizationRequest,
      res?: any
    ) => Promise<any>
  ) {
    this.http.get<{ Headers: AuthHeaders }>(endpoint, async (req, res) => {
      try {
        const payload = await this.getPayload(req);
        const request = this.getRequestObject(req, payload);
        this.setHeader(res);
        return JSON.stringify(await callback(request, res));
      } catch (ex: any) {
        console.log(ex.code);
        this.setResponseCode(res, ex);
        return ex.message;
      }
    });
  }

  postAuth(
    endpoint: string,
    callback: (req: RestRequest & RestAuthorizationRequest) => Promise<any>
  ) {
    this.http.post<{ Headers: AuthHeaders }>(endpoint, async (req, res) => {
      try {
        const payload = await this.getPayload(req);
        const request = this.getRequestObject(req, payload);
        this.setHeader(res);
        return JSON.stringify(await callback(request));
      } catch (ex: any) {
        this.setResponseCode(res, ex);
        return ex.message;
      }
    });
  }
  patchAuth(
    endpoint: string,
    callback: (req: RestRequest & RestAuthorizationRequest) => Promise<any>
  ) {
    this.http.patch<{ Headers: AuthHeaders }>(endpoint, async (req, res) => {
      try {
        const payload = await this.getPayload(req);
        const request = this.getRequestObject(req, payload);
        this.setHeader(res);
        return JSON.stringify(await callback(request));
      } catch (ex: any) {
        this.setResponseCode(res, ex);
        return ex.message;
      }
    });
  }

  deleteAuth(
    endpoint: string,
    callback: (req: RestRequest & RestAuthorizationRequest) => Promise<any>
  ) {
    this.http.delete<{ Headers: AuthHeaders }>(endpoint, async (req, res) => {
      try {
        const payload = await this.getPayload(req);
        const request = this.getRequestObject(req, payload);
        this.setHeader(res);
        return JSON.stringify(await callback(request));
      } catch (ex: any) {
        this.setResponseCode(res, ex);
        return ex.message;
      }
    });
  }

  delete(
    endpoint: string,
    callback: (req: RestRequest & RestAuthorizationRequest) => Promise<any>
  ) {
    this.http.patch<{ Headers: AuthHeaders }>(endpoint, async (req, res) => {
      try {
        const request = this.getRequestObject(req);
        this.setHeader(res);
        return JSON.stringify(await callback(request));
      } catch (ex: any) {
        this.setResponseCode(res, ex);
        return ex.message;
      }
    });
  }

  patch(
    endpoint: string,
    callback: (req: RestRequest & RestAuthorizationRequest) => Promise<any>
  ) {
    this.http.patch<{ Headers: AuthHeaders }>(endpoint, async (req, res) => {
      try {
        const request = this.getRequestObject(req);
        this.setHeader(res);
        return JSON.stringify(await callback(request));
      } catch (ex: any) {
        this.setResponseCode(res, ex);
        return ex.message;
      }
    });
  }

  get(endpoint: string, callback: (req: RestRequest) => Promise<any>) {
    this.http.get<{ Headers: AuthHeaders }>(endpoint, async (req, res) => {
      try {
        const request = this.getRequestObject(req);
        this.setHeader(res);
        return JSON.stringify(await callback(request));
      } catch (ex: any) {
        this.setResponseCode(res, ex);
        return ex.message;
      }
    });
  }
  post(endpoint: string, callback: (req: RestRequest) => Promise<any>) {
    this.http.post<{ Headers: AuthHeaders }>(endpoint, async (req, res) => {
      try {
        let request = this.getRequestObject(req);
        this.setHeader(res);
        return JSON.stringify(await callback(request));
      } catch (ex: any) {
        this.setResponseCode(res, ex);
        return ex.message;
      }
    });
  }

  private getRequestObject(req: any, payload?: any) {
    return {
      query: req.query as any,
      params: req.params as any,
      body: req.body as any,
      payload,
    };
  }
  private setHeader(res: any) {
    res.header("Content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, PATCH, DELETE");
  }

  private setResponseCode(res: any, exception: any) {
    console.log(exception, exception instanceof TwoFAError);
    if (exception.code === "ERR_JWT_EXPIRED") {
      return res.code(401);
    } else if (exception.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
      return res.code(402);
    } else if (exception instanceof TwoFAError) {
      return res.code(403);
    }
    return res.code(400);
  }
}
