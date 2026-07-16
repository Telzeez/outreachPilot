export const ENRICHMENT_PROVIDER = 'ENRICHMENT_PROVIDER';

export interface EnrichmentContact {
  name: string;
  email: string;
  role: string;
}

export interface EnrichmentProvider {
  name: string;
  findContacts(domain: string): Promise<EnrichmentContact[]>;
}
