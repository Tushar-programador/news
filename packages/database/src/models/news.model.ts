import { Schema, model, Document, Types } from 'mongoose';
import type { ImportanceLevel } from '@tradepulse/shared';

export interface INews extends Document {
  headline: string;
  content: string;
  url: string;
  publishedAt: Date;
  sourceId?: Types.ObjectId;
  importance: ImportanceLevel;
  category: string;
  createdAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    headline: { type: String, required: true },
    content: { type: String, required: true },
    url: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    sourceId: { type: Schema.Types.ObjectId, ref: 'Source' },
    importance: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    category: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NewsModel = model<INews>('News', newsSchema);
