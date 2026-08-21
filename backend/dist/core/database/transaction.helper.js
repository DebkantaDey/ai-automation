"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = withTransaction;
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('TransactionHelper');
async function withTransaction(connection, operation) {
    const session = await connection.startSession();
    try {
        session.startTransaction();
        const result = await operation(session);
        await session.commitTransaction();
        return result;
    }
    catch (error) {
        logger.warn(`Transaction aborted: ${error.message}`);
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
}
//# sourceMappingURL=transaction.helper.js.map