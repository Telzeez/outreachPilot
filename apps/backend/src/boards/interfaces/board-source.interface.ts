export interface JobListing {
  companyName: string;
  website?: string;
  role: string;
  source: string;
  applyUrl: string;
  postedAt: Date;
}

export const BOARD_SOURCE = 'BOARD_SOURCE';

export interface BoardSource {
  name: string;
  fetchListings(): Promise<JobListing[]>;
}
