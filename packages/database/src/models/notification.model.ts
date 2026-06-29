import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  newsId: Types.ObjectId;
  channel: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  latencyMs?: number;
}

const notificationSchema = new Schema<INotification>(
  {
    newsId: { type: Schema.Types.ObjectId, ref: 'News', required: true },
    channel: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: { type: Date },
    latencyMs: { type: Number },
  },
  { timestamps: true }
);

export const NotificationModel = model<INotification>('Notification', notificationSchema);
