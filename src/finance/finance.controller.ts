import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from '../user/schemas/user.schema';
import {
  CreateFinanceStructureDto,
  UpdateFinanceStructureDto,
} from './types/finance-structure.dto';
import {
  CreateFinanceInvoiceDto,
  UpdateFinanceInvoiceDto,
} from './types/finance-invoice.dto';
import { CreateFinanceEntryDto } from './types/finance-entry.dto';
import {
  GetStructuresQueryDto,
  GetInvoicesQueryDto,
  GetEntriesQueryDto,
} from './types/finance-query.dto';
import {
  GetFinanceStructuresResponse,
  GetFinanceStructureResponse,
  GetFinanceInvoicesResponse,
  GetFinanceInvoiceResponse,
  GetFinanceEntriesResponse,
  GetFinanceEntryResponse,
  GetLedgerResponse,
  OutstandingInvoicesResponse,
  GetPaymentHistoryResponse,
  TotalIncomeResponse,
  TotalExpenseResponse,
  OutstandingBalanceResponse,
} from './types/finance-response.dto';
import { FinanceEntityType } from './finance.enums';
import { FinanceStructureDocument } from './schemas/finance-structure.schema';
import { FinanceInvoiceDocument } from './schemas/finance-invoice.schema';
import { FinanceEntryDocument } from './schemas/finance-entry.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1/finance')
@UseGuards(AuthGuard)
export class FinanceController {
  private readonly logger = new Logger(FinanceController.name);

  constructor(private readonly financeService: FinanceService) {}

  private getSchoolId(req: AuthenticatedRequest): string {
    const schoolId = req.user?.school_id;
    if (!schoolId) {
      this.logger.warn({ message: 'No school_id on user' });
      throw new BadRequestException(
        'No school id associated with the requested user',
      );
    }
    return schoolId.toString();
  }

  // ---------- Structures ----------
  @Post('structures')
  async createStructure(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateFinanceStructureDto,
  ): Promise<{ data: FinanceStructureDocument; message?: string }> {
    try {
      const schoolId = this.getSchoolId(req);
      this.logger.debug({ message: 'Create finance structure', dto });
      const data = await this.financeService.createStructure(schoolId, dto);
      return { data, message: 'Finance structure created successfully' };
    } catch (error) {
      this.logger.error({ error, message: 'Error creating finance structure' });
      throw error;
    }
  }

  @Get('structures')
  async getStructures(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetStructuresQueryDto,
  ): Promise<GetFinanceStructuresResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.findStructures(schoolId, query);
      return { data, message: 'Finance structures retrieved successfully' };
    } catch (error) {
      this.logger.error({ error, message: 'Error retrieving finance structures' });
      throw error;
    }
  }

  @Get('structures/:id')
  async getStructureById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GetFinanceStructureResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.findStructureById(id, schoolId);
      if (!data) {
        throw new NotFoundException(`Finance structure with id ${id} not found`);
      }
      return { data, message: 'Finance structure retrieved successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error retrieving finance structure' });
      throw error;
    }
  }

  @Patch('structures/:id')
  async updateStructure(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateFinanceStructureDto,
  ): Promise<{ data: FinanceStructureDocument; message?: string }> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.updateStructure(id, schoolId, dto);
      return { data, message: 'Finance structure updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error updating finance structure' });
      throw error;
    }
  }

  @Delete('structures/:id')
  async deleteStructure(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ data: FinanceStructureDocument; message?: string }> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.deleteStructure(id, schoolId);
      return { data, message: 'Finance structure deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error deleting finance structure' });
      throw error;
    }
  }

  // ---------- Invoices ----------
  @Post('invoices')
  async createInvoice(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateFinanceInvoiceDto,
  ): Promise<{ data: FinanceInvoiceDocument; message?: string }> {
    try {
      const schoolId = this.getSchoolId(req);
      this.logger.debug({ message: 'Create finance invoice', dto });
      const data = await this.financeService.createInvoice(schoolId, dto);
      return { data, message: 'Finance invoice created successfully' };
    } catch (error) {
      this.logger.error({ error, message: 'Error creating finance invoice' });
      throw error;
    }
  }

  @Get('invoices')
  async getInvoices(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetInvoicesQueryDto,
  ): Promise<GetFinanceInvoicesResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.findInvoices(schoolId, query);
      return { data, message: 'Finance invoices retrieved successfully' };
    } catch (error) {
      this.logger.error({ error, message: 'Error retrieving finance invoices' });
      throw error;
    }
  }

  @Get('invoices/outstanding')
  async getOutstandingInvoices(
    @Request() req: AuthenticatedRequest,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ): Promise<OutstandingInvoicesResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.findOutstandingInvoices(
        schoolId,
        entityType as FinanceEntityType | undefined,
        entityId,
      );
      return { data, message: 'Outstanding invoices retrieved successfully' };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving outstanding invoices',
      });
      throw error;
    }
  }

  @Get('invoices/entity/:entityType/:entityId')
  async getInvoicesByEntity(
    @Param('entityType') entityType: FinanceEntityType,
    @Param('entityId') entityId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GetFinanceInvoicesResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.findInvoicesByEntity(
        schoolId,
        entityType,
        entityId,
      );
      return { data, message: 'Invoices for entity retrieved successfully' };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving invoices by entity',
      });
      throw error;
    }
  }

  @Get('invoices/:id/payment-history')
  async getInvoicePaymentHistory(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GetPaymentHistoryResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const entries = await this.financeService.getInvoicePaymentHistory(
        id,
        schoolId,
      );
      const invoice = await this.financeService.findInvoiceById(id, schoolId);
      const data = entries.map((entry) => ({
        entry,
        invoice: invoice ?? null,
      }));
      return { data, message: 'Invoice payment history retrieved successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({
        error,
        message: 'Error retrieving invoice payment history',
      });
      throw error;
    }
  }

  @Get('invoices/:id')
  async getInvoiceById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GetFinanceInvoiceResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.findInvoiceById(id, schoolId);
      if (!data) {
        throw new NotFoundException(`Finance invoice with id ${id} not found`);
      }
      return { data, message: 'Finance invoice retrieved successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error retrieving finance invoice' });
      throw error;
    }
  }

  @Patch('invoices/:id')
  async updateInvoice(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateFinanceInvoiceDto,
  ): Promise<{ data: FinanceInvoiceDocument; message?: string }> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.updateInvoice(id, schoolId, dto);
      return { data, message: 'Finance invoice updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error({ error, message: 'Error updating finance invoice' });
      throw error;
    }
  }

  @Delete('invoices/:id')
  async deleteInvoice(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ data: FinanceInvoiceDocument; message?: string }> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.deleteInvoice(id, schoolId);
      return { data, message: 'Finance invoice deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error deleting finance invoice' });
      throw error;
    }
  }

  // ---------- Entries ----------

  @Post('entries')
  async createEntry(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateFinanceEntryDto,
  ): Promise<{ data: FinanceEntryDocument; message?: string }> {
    try {
      const schoolId = this.getSchoolId(req);
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new BadRequestException('User id not found');
      }
      this.logger.debug({ message: 'Create finance entry', dto });
      const data = await this.financeService.createEntry(schoolId, userId, dto);
      return { data, message: 'Finance entry created successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error({ error, message: 'Error creating finance entry' });
      throw error;
    }
  }

  @Get('entries')
  async getEntries(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetEntriesQueryDto,
  ): Promise<GetFinanceEntriesResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.findEntries(schoolId, query);
      return { data, message: 'Finance entries retrieved successfully' };
    } catch (error) {
      this.logger.error({ error, message: 'Error retrieving finance entries' });
      throw error;
    }
  }

  @Get('entries/:id')
  async getEntryById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GetFinanceEntryResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const data = await this.financeService.findEntryById(id, schoolId);
      if (!data) {
        throw new NotFoundException(`Finance entry with id ${id} not found`);
      }
      return { data, message: 'Finance entry retrieved successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error retrieving finance entry' });
      throw error;
    }
  }

  @Get('ledger/:entityType/:entityId')
  async getLedger(
    @Param('entityType') entityType: FinanceEntityType,
    @Param('entityId') entityId: string,
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ): Promise<GetLedgerResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const data = await this.financeService.getLedger(
        schoolId,
        entityType,
        entityId,
        limitNum,
      );
      return { data, message: 'Ledger retrieved successfully' };
    } catch (error) {
      this.logger.error({ error, message: 'Error retrieving ledger' });
      throw error;
    }
  }

  // ---------- Advanced ----------
  @Get('reports/income')
  async getTotalIncome(
    @Request() req: AuthenticatedRequest,
  ): Promise<TotalIncomeResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const total = await this.financeService.getTotalIncome(schoolId);
      return {
        data: { total },
        message: 'Total income retrieved successfully',
      };
    } catch (error) {
      this.logger.error({ error, message: 'Error retrieving total income' });
      throw error;
    }
  }

  @Get('reports/expense')
  async getTotalExpense(
    @Request() req: AuthenticatedRequest,
  ): Promise<TotalExpenseResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const total = await this.financeService.getTotalExpense(schoolId);
      return {
        data: { total },
        message: 'Total expense retrieved successfully',
      };
    } catch (error) {
      this.logger.error({ error, message: 'Error retrieving total expense' });
      throw error;
    }
  }

  @Get('reports/student/:studentId/outstanding')
  async getStudentOutstandingBalance(
    @Param('studentId') studentId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<OutstandingBalanceResponse> {
    try {
      const schoolId = this.getSchoolId(req);
      const outstanding = await this.financeService.getStudentOutstandingBalance(
        schoolId,
        studentId,
      );
      return {
        data: {
          outstanding,
          entityType: FinanceEntityType.STUDENT,
          entityId: studentId,
        },
        message: 'Student outstanding balance retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving student outstanding balance',
      });
      throw error;
    }
  }
}
