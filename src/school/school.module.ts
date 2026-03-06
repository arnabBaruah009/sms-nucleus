import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from './schemas/school.schema';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [MongooseModule, SchoolService],
})
export class SchoolModule { }
