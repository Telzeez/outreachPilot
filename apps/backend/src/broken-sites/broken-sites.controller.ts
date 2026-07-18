import { Controller, Post, Body } from '@nestjs/common';
import { BrokenSitesService } from './broken-sites.service';

@Controller('broken-sites')
export class BrokenSitesController {
  constructor(private readonly brokenSitesService: BrokenSitesService) {}

  @Post('seed')
  async seedDomains(@Body() body: { domains: string[] }) {
    if (!body.domains || !Array.isArray(body.domains)) {
      return { message: 'Please provide an array of domains' };
    }

    for (const domain of body.domains) {
      await this.brokenSitesService.addDomainToCheck(domain);
    }

    return { message: `Queued ${body.domains.length} domains for checking.` };
  }

  @Post('search-seed')
  async searchAndSeed(@Body() body: { query: string }) {
    if (!body.query || typeof body.query !== 'string') {
      return { message: 'Please provide a valid search query' };
    }

    return await this.brokenSitesService.searchAndSeed(body.query);
  }
}
