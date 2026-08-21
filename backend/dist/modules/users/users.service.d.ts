import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    findById(id: string): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    updateProfile(userId: string, updates: {
        firstName?: string;
        lastName?: string;
        profileImage?: string;
        phoneNumber?: string;
    }): Promise<{
        id: import("mongoose").Types.ObjectId;
        email: string;
        firstName: string;
        lastName: string;
        fullName: string;
        profileImage: string;
        phoneNumber: string;
    }>;
}
