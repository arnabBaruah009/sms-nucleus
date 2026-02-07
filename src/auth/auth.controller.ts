import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './types/auth.dto';
import { AuthGuard } from './auth.guard';
import { AllowListService } from './allow-list.service';
import { CreateAllowListDto } from './types/allow-list.dto';
import { UserDocument, UserRole } from '../user/schemas/user.schema';
import { AllowListDocument } from './schemas/allow-list.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private allowListService: AllowListService,
  ) { }

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

  @Post('login')
  async login(
    @Req() req: any,
    @Body('user') loginDto: AuthDto,
  ): Promise<{
    data: { isEmailVerified: boolean; accessToken: string; schoolId: string };
  }> {
    try {
      this.logger.debug({
        message: `Recieved request for logging in`,
        loginDto,
      });

      const userAgent = req.headers['user-agent'];
      return { data: await this.authService.loginUser(loginDto, userAgent) };
    } catch (err) {
      this.logger.error({
        error: err,
        message: `Error while logging in`,
      });
      throw err;
    }
  }

  @Get('logout')
  async logout(@Request() req): Promise<{ status: boolean }> {
    try {
      const authorizationHeader = req?.headers?.authorization;
      if (!authorizationHeader) {
        throw new BadRequestException('No token found');
      }
      const reqToken = req.headers.authorization.split(' ')[1];
      this.logger.debug({
        token: reqToken,
        message: `Logging out user token`,
      });
      return { status: await this.authService.logoutMember(reqToken) };
    } catch (err) {
      this.logger.error({ error: err, message: `Error while logging out` });
      throw new InternalServerErrorException(
        err.message || `Something went wrong, while logging out`,
      );
    }
  }

  @Get('allow-list')
  @UseGuards(AuthGuard)
  async getAllowList(
    @Request() req: AuthenticatedRequest,
  ): Promise<{ data: AllowListDocument[]; message: string }> {
    try {
      this.logger.debug({ message: 'Received request to get allow list' });
      const data = await this.allowListService.findAll();
      return { data, message: 'Allow list retrieved successfully' };
    } catch (err) {
      this.logger.error({
        error: err,
        message: 'Error while getting allow list',
      });
      throw err;
    }
  }

  @Post('allow-list')
  @UseGuards(AuthGuard)
  async createAllowList(
    @Request() req: AuthenticatedRequest,
    @Body('allowList') createAllowListDto: CreateAllowListDto,
  ): Promise<{ data: AllowListDocument; message: string }> {
    try {
      this.logger.debug({
        message: 'Received request to create allow list record',
        createAllowListDto,
      });
      if (req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('You are not authorized!');
      }
      const data = await this.allowListService.create(
        createAllowListDto,
        req.user._id.toString(),
      );
      return { data, message: 'Allow list record created successfully' };
    } catch (err) {
      this.logger.error({
        error: err,
        message: 'Error while creating allow list record',
      });
      throw err;
    }
  }

  @Delete('allow-list/:id')
  @UseGuards(AuthGuard)
  async deleteAllowList(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ data: AllowListDocument; message: string }> {
    try {
      this.logger.debug({
        message: 'Received request to delete allow list record',
        id,
        user: req.user._id.toString(),
      });
      if (req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('You are not authorized!');
      }
      const data = await this.allowListService.delete(id);
      return { data, message: 'Allow list record deleted successfully' };
    } catch (err) {
      this.logger.error({
        error: err,
        message: 'Error while deleting allow list record',
      });
      throw err;
    }
  }
}
