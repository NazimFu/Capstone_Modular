import { Schema, model } from 'mongoose';

interface IMessage {
  messageId: string;
  channel: string;
  username: string;
  text: string;
  timestamp: number;
  action: 'allow' | 'hide' | 'delete_for_all';
  labels: Record<string, number>;
  confidence: number;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  messageId: { type: String, required: true, index: true },
  channel: { type: String, required: true, index: true },
  username: { type: String, required: true, index: true },
  text: { type: String, required: true },
  timestamp: { type: Number, required: true },
  action: { type: String, enum: ['allow', 'hide', 'delete_for_all'], required: true },
  labels: { type: Schema.Types.Mixed },
  confidence: { type: Number }
}, { timestamps: true });

messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ username: 1, createdAt: -1 });

export default model<IMessage>('Message', messageSchema);