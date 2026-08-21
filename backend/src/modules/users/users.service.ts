import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async updateProfile(
    userId: string,
    updates: { firstName?: string; lastName?: string; profileImage?: string; phoneNumber?: string },
  ) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName || ''}`.trim(),
      profileImage: user.profileImage,
      phoneNumber: user.phoneNumber,
    };
  }
}
