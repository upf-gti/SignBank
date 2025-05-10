import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

@Injectable()
export class MongoDBService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private collections: Record<string, Collection> = {};
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
      
      // Initialize collections
      this.collections = {
        users: this.db.collection('users'),
        dialects: this.db.collection('dialects'),
        words: this.db.collection('words'),
        wordEdits: this.db.collection('wordEdits'),
        wordEditHistoric: this.db.collection('wordEditHistoric'),
        wordRequests: this.db.collection('wordRequests'),
        videos: this.db.collection('videos')
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
  get users(): Collection {
    return this.collections.users;
  }

  get dialects(): Collection {
    return this.collections.dialects;
  }

  get words(): Collection {
    return this.collections.words;
  }

  get wordEdits(): Collection {
    return this.collections.wordEdits;
  }

  get wordEditHistoric(): Collection {
    return this.collections.wordEditHistoric;
  }

  get wordRequests(): Collection {
    return this.collections.wordRequests;
  }

  get videos(): Collection {
    return this.collections.videos;
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
      'wordId', 'editorId', 'creatorId', 'newWordVersionId', 
      'acceptedById', 'denyerId', 'originalWordId', 'activeWordId',
      'dialectId', 'wordRequestId'
    ];
    
    objectIdFields.forEach(field => {
      if (result[field]) {
        // Add validation to check if it's a valid ObjectId string (24 hex characters)
        if (typeof result[field] === 'string' && /^[0-9a-fA-F]{24}$/.test(result[field])) {
          result[field] = ObjectId.createFromHexString(result[field]);
        }
        // If not a valid ObjectId string, leave it as is to be handled by the application
      }
    });

    // Handle nested documents
    if (result.wordData?.relatedWords) {
      result.wordData.relatedWords = result.wordData.relatedWords.map((rel: any) => {
        const mapped = { ...rel };
        // Check if wordId is a valid ObjectId string before converting
        if (rel.wordId && typeof rel.wordId === 'string' && /^[0-9a-fA-F]{24}$/.test(rel.wordId)) {
          mapped.wordId = ObjectId.createFromHexString(rel.wordId);
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