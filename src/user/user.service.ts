import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SchoolDocument } from 'src/school/schemas/school.schema';
import { Gender } from './types/profile.dto';
import { ProfileDetails } from './types/profile-response.dto';

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

  async findUserById(userId: string): Promise<UserDocument | null> {
    try {
      return await this.userModel
        .findOne({ _id: userId, deleted_at: null })
        .exec();
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

  transformToProfileDetails(user: UserDocument, school?: SchoolDocument): ProfileDetails {

    const profileDetails: ProfileDetails = {
      id: user._id.toString(),
      name: user.name || '',
      phone_number: user.phone_number || '',
      email: user.email || '',
      avatar_url: user.avatar_url,
      gender: user.gender as Gender,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      school_id: user.school_id,
      created_at: (user as any).createdAt?.toISOString() || new Date().toISOString(),
      updated_at: (user as any).updatedAt?.toISOString() || new Date().toISOString(),
      deleted_at: user.deleted_at?.toISOString() || null,
    };

    if (school) {
      profileDetails.school = {
        id: school._id.toString(),
        name: school.name,
        phone_number: school.phone_number,
        email: school.email,
        address_line: school.address_line,
        city: school.city,
        state: school.state,
        country: school.country,
        pincode: school.pincode,
        level: school.level,
        board: school.board,
        type: school.type,
        primary_contact_name: school.primary_contact_name,
        primary_contact_number: school.primary_contact_number,
        logo_url: school.logo_url,
        created_at: (school as any).createdAt?.toISOString() || new Date().toISOString(),
        updated_at: (school as any).updatedAt?.toISOString() || new Date().toISOString(),
        deleted_at: school.deleted_at?.toISOString() || null,
      };
    }

    return profileDetails;
  }
}
