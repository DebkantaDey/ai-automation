import { Connection, ClientSession } from 'mongoose';
import { Logger } from '@nestjs/common';

const logger = new Logger('TransactionHelper');

export async function withTransaction<T>(
  connection: Connection,
  operation: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await connection.startSession();
  try {
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error: any) {
    logger.warn(`Transaction aborted: ${error.message}`);
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
