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
  ) {}

  async registerUser(
    register: AuthDto,
    userAgent: string,
    ssoAgent = 'sms-nucleus',
  ): Promise<void> {
    try {
      const phone_number = register.phone_number.toLowerCase();
      const password = register.password;

      this.logger.debug({
        message: `Registering user`,
        phone_number,
      });

      // input validation
      if (!phone_number || !password) {
        this.logger.error({
          message: `Invalid request payload`,
          phone_number,
        });
        throw new BadRequestException(AuthMessages.INVALID_LOGIN_PAYLOAD);
      }

      // user existence check
      const userExists = await this.userService.findUserByPhoneNumber(phone_number);
      if (userExists) {
        throw new BadRequestException(AuthMessages.USER_ALREADY_EXISTS);
      }

      // create new user
      const user = await this.userService.createUser({
        name: register.name,
        email: register.email?.toLowerCase(),
        password: password,
        phone_number: register.phone_number,
        role: register.role,
        school_id: register.school_id,
        gender: register.gender,
        avatar_url: register.avatar_url,
      });
      
      this.logger.debug({
        message: `New user registered`,
        email: register.email?.toLowerCase(),
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
}
