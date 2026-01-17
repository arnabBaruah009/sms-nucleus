import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
  Redirect,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './types/auth.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Req() req: any,
    @Body('user') registerDto: AuthDto,
  ): Promise<{
    registrationStatus: boolean;
    error: any;
  }> {
    try {
      this.logger.debug({
        message: `Received request for registering`,
        registerDto,
      });

      const userAgent = req.headers['user-agent'];
      await this.authService.registerUser(
        registerDto,
        userAgent,
      );
      return { registrationStatus: true, error: null };
    } catch (err) {
      this.logger.error({
        error: err,
        message: `Error while registering`,
      });
      throw err;
    }
  }
}
