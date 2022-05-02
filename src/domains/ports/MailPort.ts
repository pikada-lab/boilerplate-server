export interface MailPort {
  send(email: string, subject: string, text: string): Promise<any>;
}
