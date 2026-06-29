export type ImportanceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RawNews {
  id: string;
  source: string;
  headline: string;
  body: string;
  url: string;
  publishedAt: Date;
  metadata: Record<string, unknown>;
}

export interface AIAnalysis {
  summary: string;
  importance: ImportanceLevel;
  category: string;
  bullish: string[];
  bearish: string[];
  confidence: number;
  reason: string;
}

export interface QueueJobData {
  news: RawNews;
}
