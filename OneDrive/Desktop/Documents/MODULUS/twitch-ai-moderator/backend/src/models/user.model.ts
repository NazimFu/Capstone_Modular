import { Schema, model } from 'mongoose';

interface IUser {
  twitchUserId: string;
  username: string;
  accessToken: string; // Encrypted
  refreshToken: string; // Encrypted
  assignedChannels: string[];
  channelSettings: Record<string, {
    p_toxic_delete: number;
    p_toxic_allow: number;
    stage2_hate: number;
    stage2_harassment: number;
    stage2_sexual: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  twitchUserId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  accessToken: { type: String, required: true }, // TODO: Encrypt with crypto
  refreshToken: { type: String, required: true },
  assignedChannels: [{ type: String }],
  channelSettings: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default model<IUser>('User', userSchema);