import { UsersService } from './users.service';
declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    phoneNumber?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        email: string;
        firstName: string;
        lastName: string;
        fullName: string;
        profileImage: string;
        phoneNumber: string;
        emailVerified: boolean;
        status: import("./schemas/user.schema").UserStatus;
        systemRole: import("../../core/common/enums/role.enum").SystemRole;
        createdAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: import("mongoose").Types.ObjectId;
        email: string;
        firstName: string;
        lastName: string;
        fullName: string;
        profileImage: string;
        phoneNumber: string;
    }>;
}
export {};
