import { Schema, model, Document, Types } from 'mongoose';
import type { ImportanceLevel } from '@tradepulse/shared';

export interface IAIAnalysis extends Document {
  newsId: Types.ObjectId;
  summary: string;
  importance: ImportanceLevel;
  category: string;
  bullish: string[];
  bearish: string[];
  confidence: number;
  reason: string;
  modelName: string;
  tokens: number;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>({
  newsId: { type: Schema.Types.ObjectId, ref: 'News', required: true },
  summary: { type: String, required: true },
  importance: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
  category: { type: String, required: true },
  bullish: [{ type: String }],
  bearish: [{ type: String }],
  confidence: { type: Number, required: true, min: 0, max: 1 },
  reason: { type: String, required: true },
  modelName: { type: String, required: true },
  tokens: { type: Number, required: true },
});

export const AIAnalysisModel = model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);
