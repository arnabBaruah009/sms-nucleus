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
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinanceStructure.name, schema: FinanceStructureSchema },
      { name: FinanceInvoice.name, schema: FinanceInvoiceSchema },
      { name: FinanceEntry.name, schema: FinanceEntrySchema },
    ]),
    AuthModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
