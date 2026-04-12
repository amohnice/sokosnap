import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  userId: string;
  name: string;
  tagline?: string;
  slug: string;
  description?: string;
  mpesaNumber: string;
  themeColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  tagline: { type: String },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  mpesaNumber: { type: String, required: true },
  themeColor: { type: String, default: '#003C43' },
}, { timestamps: true });

export default mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);
