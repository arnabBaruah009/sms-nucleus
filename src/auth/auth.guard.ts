import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserDocument } from '../user/schemas/user.schema';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { AuthMessages } from './constants/auth-messages.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);
  constructor(
    private authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const isPublic = this.reflector.get<boolean>(
        'isPublic',
        context.getHandler(),
      );

      if (isPublic) return true;

      this.logger.debug({
        message: 'Checking authorization header',
      });

      if (!request.headers.authorization) {
        this.logger.warn({
          message: 'No token present in the request headers',
        });
        throw new HttpException(
          {
            message: AuthMessages.NO_TOKEN_PRESENT,
            redirectTo: `${process.env.DEFAULT_FE_URL}/auth/login`,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const token = request.headers.authorization.split(' ')[1];
      if (!token) {
        this.logger.warn({
          message: 'No valid token found in the request headers',
          token,
        });
        throw new HttpException(
          {
            message: AuthMessages.NO_TOKEN_PRESENT,
            redirectTo: `${process.env.DEFAULT_FE_URL}/auth/login`,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      this.logger.debug({
        message: `Fetching user for token`,
        token,
      });
      const user: UserDocument | null = await this.authService.getUser(token);
      if (!user) {
        this.logger.warn({
          message: `Invalid token, no user found for the request`,
          token,
          user,
        });
        throw new HttpException(
          {
            message: AuthMessages.NO_TOKEN_PRESENT,
            redirectTo: `${process.env.DEFAULT_FE_URL}/auth/login`,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      this.logger.debug({
        message: `Request authorized for user`,
        token,
        user,
      });
      request.user = user;
      return true;
    } catch (error) {
      this.logger.error(
        { error: error, message: `Error occurred: ${error.message}` },
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(AuthMessages.SOMETHING_WENT_WRONG);
    }
  }
}
