import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MongoClient, Db, Collection, ObjectId, Document } from 'mongodb';
import { 
  User, 
  GlossRequest, 
  DictionaryEntry
} from '../../types/database';

@Injectable()
export class MongoDBService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private collections: {
    users: Collection<User>;
    dictionaryEntries: Collection<DictionaryEntry>;
    glossRequests: Collection<GlossRequest>;
  };
  private isConnected = false;

  constructor() {
    const dbUrl = process.env.DATABASE_URL || '';
    this.client = new MongoClient(dbUrl);
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.client.connect();
      this.db = this.client.db();
      this.isConnected = true;
      
      // Initialize collections based on new schema
      this.collections = {
        users: this.db.collection<User>('users'),
        dictionaryEntries: this.db.collection<DictionaryEntry>('dictionaryEntries'),
        glossRequests: this.db.collection<GlossRequest>('glossRequests'),
      };
      
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.close();
      this.isConnected = false;
    } catch (error) {
      throw error;
    }
  }

  // Get MongoDB collections
  get users(): Collection<User> {
    return this.collections.users;
  }

  get dictionaryEntries(): Collection<DictionaryEntry> {
    return this.collections.dictionaryEntries;
  }

  get glossRequests(): Collection<GlossRequest> {
    return this.collections.glossRequests;
  }

  // Helper to convert string IDs to ObjectIds
  toObjectId(id: string): ObjectId {
    return ObjectId.createFromHexString(id);
  }
  
  // Helper to convert ObjectIds to strings in retrieved documents
  formatDocument<T>(doc: any): T {
    if (!doc) return doc;

    // Convert _id to string id
    if (doc._id) {
      doc.id = doc._id.toString();
      delete doc._id;
    }

    // Process nested objects that might have ObjectIds
    Object.keys(doc).forEach(key => {
      // Convert any ObjectId to string
      if (doc[key] instanceof ObjectId) {
        doc[key] = doc[key].toString();
      }
      // Process arrays
      else if (Array.isArray(doc[key])) {
        doc[key] = doc[key].map((item: any) => {
          if (item instanceof ObjectId) {
            return item.toString();
          } else if (typeof item === 'object' && item !== null) {
            return this.formatDocument(item);
          }
          return item;
        });
      }
      // Process nested objects
      else if (typeof doc[key] === 'object' && doc[key] !== null) {
        doc[key] = this.formatDocument(doc[key]);
      }
    });

    return doc as T;
  }

  // Helper to prepare document for insertion
  prepareDocumentForDB(doc: any): any {
    const result = { ...doc };
    
    // Convert string id to ObjectId _id if present
    if (result.id) {
      result._id = ObjectId.createFromHexString(result.id);
      delete result.id;
    }

    // Convert string IDs to ObjectIds in specific fields
    const objectIdFields = [
      'glossId',
      'creatorId',
      'acceptedById',
      'deniedById',
      'glossRequestId'
    ];
    
    objectIdFields.forEach(field => {
      if (result[field]) {
        // Add validation to check if it's a valid ObjectId string (24 hex characters)
        if (typeof result[field] === 'string' && /^[0-9a-fA-F]{24}$/.test(result[field])) {
          result[field] = ObjectId.createFromHexString(result[field]);
        }
      }
    });

    // Handle nested documents
    if (result.gloss?.relatedGlosses) {
      result.gloss.relatedGlosses = result.gloss.relatedGlosses.map((rel: any) => {
        const mapped = { ...rel };
        if (rel.glossId && typeof rel.glossId === 'string' && /^[0-9a-fA-F]{24}$/.test(rel.glossId)) {
          mapped.glossId = ObjectId.createFromHexString(rel.glossId);
        }
        return mapped;
      });
    }

    // Handle dates
    const dateFields = ['createdAt', 'updatedAt', 'archivedAt'];
    dateFields.forEach(field => {
      if (result[field] && !(result[field] instanceof Date)) {
        result[field] = new Date(result[field]);
      }
    });

    return result;
  }

  // Create MongoDB session for transactions
  async startSession() {
    return this.client.startSession();
  }
} 