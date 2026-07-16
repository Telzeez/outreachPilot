import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, BadRequestException, Delete, Param, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadsService, CreateLeadDto, UpdateLeadDto } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getLeads() {
    return this.leadsService.getAllLeads();
  }

  @Post()
  async createLead(@Body() dto: CreateLeadDto) {
    if (!dto.companyName) {
      throw new BadRequestException('companyName is required');
    }
    return this.leadsService.createLead(dto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const isCsvExtension = file.originalname.endsWith('.csv');
    const isExcelExtension = file.originalname.endsWith('.xls') || file.originalname.endsWith('.xlsx');

    if (!allowedTypes.includes(file.mimetype) && !isCsvExtension && !isExcelExtension) {
      throw new BadRequestException('File must be a CSV or Excel spreadsheet');
    }

    return this.leadsService.importLeads(file.buffer);
  }

  @Delete(':id')
  async deleteLead(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Lead ID is required');
    }
    return this.leadsService.deleteLead(id);
  }

  @Put(':id')
  async updateLead(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    if (!id) {
      throw new BadRequestException('Lead ID is required');
    }
    return this.leadsService.updateLead(id, dto);
  }
}
