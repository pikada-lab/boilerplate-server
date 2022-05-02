import { ConfigService } from "../../utilites/ConfigService";
import { MailPort } from "./MailPort";

export class FakeMailPort implements MailPort {
  mail: any;

  constructor(private config: ConfigService, private silens: boolean = true) {}
  async init() {}
  async send(email: string, subject: string, text: string) {
    if (!this.silens) {
      console.log("[E] *******\n", email);
      console.log("    *******\n", subject);
      console.log("    -------\n", text, "\n");
    }
  }
}
