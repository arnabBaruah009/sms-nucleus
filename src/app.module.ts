import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';
import { SchoolModule } from './school/school.module';
import { UploadModule } from './upload/upload.module';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { SubjectModule } from './subject/subject.module';
import { ExamModule } from './exam/exam.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/sms-nucleus',
      {
        connectionFactory: (connection) => {
          if (connection.readyState === 1) {
            console.log('✅ MongoDB connected successfully');
          }
          return connection;
        },
      },
    ),
    AuthModule,
    SessionModule,
    UserModule,
    SchoolModule,
    UploadModule,
    StudentModule,
    TeacherModule,
    SubjectModule,
    ExamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
