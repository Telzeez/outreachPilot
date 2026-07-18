import { Controller, Get, Put, Body, Param, BadRequestException, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OutreachService, UpdateMessageDto } from './outreach.service';
import { AiDraftService } from './ai-draft.service';
import { DigestService } from './digest.service';

@Controller('outreach')
export class OutreachController {
  constructor(
    private readonly outreachService: OutreachService,
    private readonly aiDraftService: AiDraftService,
    private readonly digestService: DigestService
  ) { }

  @Post('lead/:leadId/generate')
  async generateDraft(@Param('leadId') leadId: string) {
    if (!leadId) throw new BadRequestException('Lead ID is required');
    await this.aiDraftService.generateDraftForLead(leadId);
    return { status: 'success', message: 'Draft generated successfully' };
  }

  @Post('test-digest')
  async testDigest() {
    return this.digestService.sendWeeklyDigest();
  }

  @Get('pending')
  async getPendingMessages() {
    return this.outreachService.getPendingMessages();
  }

  @Put(':id')
  async updateMessage(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    if (!id) {
      throw new BadRequestException('Message ID is required');
    }
    return this.outreachService.updateMessage(id, dto);
  }

  @Get('track/open/:messageId')
  async trackOpen(@Param('messageId') messageId: string, @Res() res: Response) {
    if (!messageId) throw new BadRequestException('Message ID is required');
    await this.outreachService.trackOpen(messageId);

    // Return a 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
  }
}
