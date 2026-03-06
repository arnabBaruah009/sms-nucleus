import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from './auth.guard';
import { SessionModule } from '../session/session.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AllowListService } from './allow-list.service';
import { AllowList, AllowListSchema } from './schemas/allow-list.schema';

@Module({
  imports: [
    forwardRef(() => SessionModule),
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: AllowList.name, schema: AllowListSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AllowListService],
  exports: [AuthGuard, AuthService],
})
export class AuthModule { }
