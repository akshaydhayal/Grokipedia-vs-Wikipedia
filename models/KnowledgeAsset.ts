// MongoDB model for Knowledge Assets

import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgeAsset extends Document {
  topic: string;
  ual: string;
  datasetRoot?: string;
  publishedAt: Date;
  author?: string;
  summary: string;
  discrepancyCount: number;
  hallucinationCount: number;
  wikipediaUrl: string;
  grokipediaUrl: string;
  jsonld: any;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeAssetSchema = new Schema<IKnowledgeAsset>(
  {
    topic: {
      type: String,
      required: true,
      index: true,
    },
    ual: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    datasetRoot: {
      type: String,
    },
    publishedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    author: {
      type: String,
    },
    summary: {
      type: String,
      required: true,
    },
    discrepancyCount: {
      type: Number,
      required: true,
      default: 0,
    },
    hallucinationCount: {
      type: Number,
      required: true,
      default: 0,
    },
    wikipediaUrl: {
      type: String,
      required: true,
    },
    grokipediaUrl: {
      type: String,
      required: true,
    },
    jsonld: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
KnowledgeAssetSchema.index({ topic: 1, publishedAt: -1 });
KnowledgeAssetSchema.index({ publishedAt: -1 });

const KnowledgeAsset =
  mongoose.models.KnowledgeAsset ||
  mongoose.model<IKnowledgeAsset>('KnowledgeAsset', KnowledgeAssetSchema);

export default KnowledgeAsset;


