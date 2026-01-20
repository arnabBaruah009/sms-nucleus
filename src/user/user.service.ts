import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) { }

  async createUser(userData: {
    name?: string;
    email?: string;
    password?: string;
    phone_number?: string;
    role?: UserRole;
    school_id?: string;
    gender?: string;
    avatar_url?: string;
  }): Promise<UserDocument> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password || 'DefaultPassword@2026', 10);

      const user = new this.userModel({
        ...userData,
        email: userData.email?.toLowerCase(),
        password: hashedPassword,
        isEmailVerified: true, // TODO: Change to false after email verification implementation
        role: userData.role || UserRole.ADMIN,
      });

      return await user.save();
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating user',
      });
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel
        .findOne({ email: email.toLowerCase(), deleted_at: null })
        .exec();
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding user by email',
      });
      throw error;
    }
  }

  async findUserByPhoneNumber(phone_number: string): Promise<UserDocument | null> {
    try {
      return await this.userModel
        .findOne({ phone_number: phone_number.toLowerCase(), deleted_at: null })
        .exec();
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding user by phone number',
      });
      throw error;
    }
  }

  async findUserById(
    userId: string,
    populateSchool: boolean = false,
  ): Promise<UserDocument | null> {
    try {
      const query = this.userModel.findOne({ _id: userId, deleted_at: null });

      if (populateSchool) {
        // Populate school and filter out deleted schools
        query.populate({
          path: 'school_id',
          match: { deleted_at: null },
        });
      }

      return await query.exec();
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding user by id',
      });
      throw error;
    }
  }

  async updateUser(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    try {
      return await this.userModel
        .findByIdAndUpdate(userId, updateData, { new: true })
        .exec();
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error updating user',
      });
      throw error;
    }
  }

  generateJwt(payload: {
    id: string;
    email?: string;
    role: UserRole;
    school_id?: string;
  }): string {
    return this.jwtService.sign(payload);
  }

  getTokenExpiryTime(expiresInMs: number): Date {
    return new Date(Date.now() + expiresInMs);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
