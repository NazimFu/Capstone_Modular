import { Schema, model } from 'mongoose';

interface IInfraction {
  username: string;
  channel: string;
  messageId: string;
  text: string;
  labels: Record<string, number>;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  action: 'deleted' | 'hidden';
  modelVersions: {
    stage1?: string;
    stage2?: string;
  };
  createdAt: Date;
}

const infractionSchema = new Schema<IInfraction>({
  username: { type: String, required: true, index: true },
  channel: { type: String, required: true, index: true },
  messageId: { type: String, required: true },
  text: { type: String, required: true },
  labels: { type: Schema.Types.Mixed, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  confidence: { type: Number, required: true },
  action: { type: String, enum: ['deleted', 'hidden'], required: true },
  modelVersions: {
    stage1: String,
    stage2: String
  }
}, { timestamps: true });

infractionSchema.index({ channel: 1, createdAt: -1 });
infractionSchema.index({ username: 1, createdAt: -1 });
infractionSchema.index({ severity: 1, createdAt: -1 });

export default model<IInfraction>('Infraction', infractionSchema);