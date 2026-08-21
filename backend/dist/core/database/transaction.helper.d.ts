import { Connection, ClientSession } from 'mongoose';
export declare function withTransaction<T>(connection: Connection, operation: (session: ClientSession) => Promise<T>): Promise<T>;
