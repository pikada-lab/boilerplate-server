export interface CallPort {
   send(phone: string): Promise<number>;
}