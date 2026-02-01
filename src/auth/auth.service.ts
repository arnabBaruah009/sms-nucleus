import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { AuthDto } from './types/auth.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../user/schemas/user.schema';
import { AuthMessages } from './constants/auth-messages.constants';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private sessionService: SessionService,
    private userService: UserService,
  ) { }

  async registerUser(
    register: AuthDto,
    userAgent: string,
    ssoAgent = 'sms-nucleus',
  ): Promise<void> {
    try {
      const phone = register.phone.toLowerCase();
      const password = register.password;

      this.logger.debug({
        message: `Registering user`,
        phone: register.phone,
      });

      // input validation
      if (!phone || !password) {
        this.logger.error({
          message: `Invalid request payload`,
          phone,
        });
        throw new BadRequestException(AuthMessages.INVALID_LOGIN_PAYLOAD);
      }

      // user existence check
      const userExists = await this.userService.findUserByPhoneNumber(phone);
      if (userExists) {
        throw new BadRequestException(AuthMessages.USER_ALREADY_EXISTS);
      }

      // create new user
      const user = await this.userService.createUser({
        phone_number: register.phone,
        password: password,
      });

      this.logger.debug({
        message: `New user registered`,
        phone: register.phone,
        ssoAgent,
        userAgent,
        user,
      });
    } catch (err) {
      this.logger.error({ error: err, message: `Error while registering` });
      throw err;
    }
  }

  async getUser(token: string): Promise<UserDocument | null> {
    try {
      return await this.sessionService.getUserByToken(token);
    } catch (err) {
      this.logger.error({
        error: err,
        message: `Error while getting user from token`,
      });
      throw err;
    }
  }

  async loginUser(
    login: AuthDto,
    userAgent: string,
    ssoAgent = 'sms-nucleus',
  ): Promise<{
    isEmailVerified: boolean;
    accessToken: string;
    schoolId: string;
  }> {
    try {
      const phone = login.phone;
      const password = login.password;

      this.logger.debug({
        message: `Logging in user`,
        phone,
      });

      // input validation
      if (!phone || !password) {
        this.logger.error({
          message: `Invalid request payload`,
          phone,
        });
        throw new BadRequestException(AuthMessages.INVALID_LOGIN_PAYLOAD);
      }

      // user existence check
      const user = await this.userService.findUserByPhoneNumber(phone);
      if (!user) {
        this.logger.error({
          message: `User does not exist`,
          phone,
        });
        throw new BadRequestException(AuthMessages.USER_DOES_NOT_EXIST);
      }

      // password verification
      const isPasswordValid = await this.userService.comparePasswords(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.error({
          message: `Incorrect password`,
          phone,
        });
        throw new BadRequestException(AuthMessages.INCORRECT_PASSWORD);
      }

      // getting token for user
      const accessToken = await this.sessionService.findTokenByUserId(
        user._id.toString(),
        userAgent,
        ssoAgent,
      );

      this.logger.debug({
        message: `User logged in successfully`,
        phone,
        userId: user._id.toString(),
      });

      return {
        isEmailVerified: user.isEmailVerified,
        accessToken,
        schoolId: user.school_id || '',
      };
    } catch (err) {
      this.logger.error({ error: err, message: `Error while logging in` });
      throw err;
    }
  }
}
