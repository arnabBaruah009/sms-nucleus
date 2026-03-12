import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FinanceStructure,
  FinanceStructureSchema,
} from './schemas/finance-structure.schema';
import {
  FinanceInvoice,
  FinanceInvoiceSchema,
} from './schemas/finance-invoice.schema';
import {
  FinanceEntry,
  FinanceEntrySchema,
} from './schemas/finance-entry.schema';
import { Student, StudentSchema } from '../student/schemas/student.schema';
import { Teacher, TeacherSchema } from '../teacher/schemas/teacher.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { School, SchoolSchema } from '../school/schemas/school.schema';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinanceStructure.name, schema: FinanceStructureSchema },
      { name: FinanceInvoice.name, schema: FinanceInvoiceSchema },
      { name: FinanceEntry.name, schema: FinanceEntrySchema },
      { name: Student.name, schema: StudentSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
    AuthModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule { }
