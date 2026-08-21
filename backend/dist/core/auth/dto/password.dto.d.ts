export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    email: string;
    newPassword: string;
    confirmNewPassword: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}
