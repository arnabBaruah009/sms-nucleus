import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionService } from './session.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { Session, SessionSchema } from './schemas/session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    forwardRef(() => JwtModule),
    forwardRef(() => UserModule),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
