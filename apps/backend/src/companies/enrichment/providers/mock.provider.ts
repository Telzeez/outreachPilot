import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentProvider, EnrichmentContact } from '../enrichment-provider.interface';

@Injectable()
export class MockEnrichmentProvider implements EnrichmentProvider {
  name = 'MockProvider';
  private readonly logger = new Logger(MockEnrichmentProvider.name);

  async findContacts(domain: string): Promise<EnrichmentContact[]> {
    this.logger.log(`Mocking enrichment for domain: ${domain}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For the MVP, we just return a fake CEO contact based on the domain
    // If the domain is missing or invalid, we handle it gracefully.
    if (!domain || !domain.includes('.')) {
      return [];
    }

    const companyName = domain.split('.')[0];
    const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

    return [
      {
        name: `Jane Doe (${capitalizedName})`,
        email: `jane.doe@${domain}`,
        role: 'CEO',
      }
    ];
  }
}
