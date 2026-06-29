import { Schema, model, Document } from 'mongoose';

export interface ISource extends Document {
  name: string;
  type: string;
  url: string;
  enabled: boolean;
  createdAt: Date;
}

const sourceSchema = new Schema<ISource>(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SourceModel = model<ISource>('Source', sourceSchema);
