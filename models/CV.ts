import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICV extends Document {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
  }>;
  skills: string[];
  certifications?: string[];
  jobSeeker: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CVSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    summary: {
      type: String,
    },
    experience: [
      {
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: String,
        endDate: String,
      },
    ],
    skills: [String],
    certifications: [String],
    jobSeeker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CV: Model<ICV> = mongoose.models.CV || mongoose.model<ICV>('CV', CVSchema);

export default CV;

