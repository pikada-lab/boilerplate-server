export interface MailPort {
  init(): Promise<void>;
  send(email: string, subject: string, text: string): Promise<any>;
}
