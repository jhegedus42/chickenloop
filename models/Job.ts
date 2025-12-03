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
  occupationalAreas?: string[];
  pictures?: string[]; // Array of image paths (max 3)
  spam?: 'yes' | 'no'; // Spam flag: 'yes' if flagged as spam, 'no' otherwise
  published?: boolean; // Published flag: true if published (visible to public), false if unpublished
  featured?: boolean; // Featured flag: true if featured, false otherwise
  applyByEmail?: boolean; // Whether applications can be submitted by email
  applyByWebsite?: boolean; // Whether applications can be submitted via website
  applyByWhatsApp?: boolean; // Whether applications can be submitted by WhatsApp
  applicationEmail?: string; // Email address for applications
  applicationWebsite?: string; // Website URL for applications
  applicationWhatsApp?: string; // WhatsApp phone number for applications (international format)
  visitCount?: number; // Number of times the job details page has been visited
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
    },
    qualifications: {
      type: [String],
    },
    sports: {
      type: [String],
    },
    occupationalAreas: {
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
    spam: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no',
    },
    published: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    applyByEmail: {
      type: Boolean,
      default: false,
    },
    applyByWebsite: {
      type: Boolean,
      default: false,
    },
    applyByWhatsApp: {
      type: Boolean,
      default: false,
    },
    applicationEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    applicationWebsite: {
      type: String,
      trim: true,
    },
    applicationWhatsApp: {
      type: String,
      trim: true,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;

