import { ConfigService } from "../../utilites/ConfigService";
import { MailPort } from "./MailPort";
const nodemailer = require("nodemailer");

export class NodeMailPort implements MailPort {
  mail: any;
  constructor(private config: ConfigService) {}
  async init() {
    this.mail = nodemailer.createTransport({
      host: this.config.mailServer,
      port: 25,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.config.mailLogin, // generated ethereal user
        pass: this.config.mailPassword, // generated ethereal password
      },
    });
  }
  async send(email: string, subject: string, text: string) {
    let info = await this.mail.sendMail({
      from: '"Fake Music Magazine" <info@fake-mm.ru>',
      to: email,
      subject: subject,
      html: text,
    });
    // console.log("Message sent: %s", info.messageId);
  }
}
