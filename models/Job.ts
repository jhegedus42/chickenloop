import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  companyId?: mongoose.Types.ObjectId;
  location: string;
  country?: string; // ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'FR')
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  languages?: string[]; // Array of language names (max 3)
  qualifications?: string[]; // Array of qualification names
  sports?: string[]; // Array of sports/activity strings
  pictures?: string[]; // Array of image paths (max 3)
  recruiter: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    location: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      trim: true,
      // ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'FR')
      // Stored in uppercase for consistency
    },
    salary: {
      type: String,
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance'],
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    languages: {
      type: [String],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 3;
        },
        message: 'A job can have at most 3 languages',
      },
    },
    qualifications: {
      type: [String],
    },
    sports: {
      type: [String],
    },
    pictures: {
      type: [String],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 3;
        },
        message: 'A job can have at most 3 pictures',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;

