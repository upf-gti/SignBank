// src/word-requests/word-requests.service.ts
import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { RequestStatus, Word, WordStatus } from '../../types/database';
import { MongoDBService } from '../mongodb/mongodb.service';
import { UpdateWordRequestDto } from './dto/update-word-request.dto'
import { CreateWordRequestDto, WordDataDto } from './dto/create-word-request.dto'

@Injectable()
export class WordRequestsService {
  constructor(private readonly mongodb: MongoDBService) {}

  /**
   * Create a new word request
   * @param creatorId - ID of the user creating the request
   * @param wordData - Data for the requested word
   */
  async createWordRequest(creatorId: string, wordData: WordDataDto) {
    try {
      // Check if the creator exists
      const objectId = this.mongodb.toObjectId(creatorId);
      const creator = await this.mongodb.users.findOne({ _id: objectId });
      
      if (!creator) {
        throw new NotFoundException(`User with ID ${creatorId} not found`);
      }
      
      // Create the request document
      const now = new Date();
      const requestDoc = {
        creatorId: objectId,
        status: RequestStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        requestedWordData: wordData
      };
      
      // Insert the document
      const result = await this.mongodb.wordRequests.insertOne(
        this.mongodb.prepareDocumentForDB(requestDoc)
      );
      
      // Return the created request
      return this.mongodb.formatDocument({
        ...requestDoc,
        _id: result.insertedId
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error.name === 'BSONTypeError') {
        throw new BadRequestException(`Invalid creator ID: ${creatorId}`);
      }
      
      throw new InternalServerErrorException(
        `Error creating word request: ${error.message}`
      );
    }
  }


  /**
   * Get word requests filtered by status
   * @param status - Status to filter by
   */
  async getWordRequestsByStatus(status: RequestStatus) {
    try {
      const requests = await this.mongodb.wordRequests.find({ status }).toArray();
      
      // Enhance with creator information
      const requestsWithCreator = await Promise.all(
        requests.map(async (request) => {
          try {
            request.creator = await this.mongodb.users.findOne({ 
              _id: request.creatorId 
            });
            
            if (request.creator) {
              // Remove sensitive data
              delete request.creator.password;
            }
          } catch (err) {
            // If we can't get creator info, just continue without it
            console.error(`Error fetching creator for request ${request._id}: ${err.message}`);
          }
          
          return request;
        })
      );
      
      return requestsWithCreator.map(request => this.mongodb.formatDocument(request));
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving word requests by status: ${error.message}`
      );
    }
  }

  /**
   * Get word requests by creator ID
   * @param creatorId - ID of the creator
   */
  async getWordRequestsByCreator(creatorId: string) {
    try {
      const creatorObjectId = this.mongodb.toObjectId(creatorId);
      const requests = await this.mongodb.wordRequests.find({ 
        creatorId: creatorObjectId 
      }).toArray();
      
      return requests.map(request => this.mongodb.formatDocument(request));
    } catch (error) {
      if (error.name === 'BSONTypeError') {
        throw new BadRequestException(`Invalid creator ID: ${creatorId}`);
      }
      
      throw new InternalServerErrorException(
        `Error retrieving word requests by creator: ${error.message}`
      );
    }
  }

  /**
   * Get a word request by ID
   * @param requestId - ID of the request
   */
  async getWordRequestById(requestId: string) {
    try {
      const requestObjectId = this.mongodb.toObjectId(requestId);
      const request = await this.mongodb.wordRequests.findOne({ _id: requestObjectId });
      
      if (!request) {
        throw new NotFoundException(`Word request with ID ${requestId} not found`);
      }
      
      return this.mongodb.formatDocument(request);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error.name === 'BSONTypeError') {
        throw new BadRequestException(`Invalid request ID: ${requestId}`);
      }
      
      throw new InternalServerErrorException(
        `Error retrieving word request: ${error.message}`
      );
    }
  }

  /**
   * Update a word request
   * @param requestId - ID of the request to update
   * @param updateData - Data to update
   */
  async updateWordRequest(requestId: string, updateData: Word) {
    try {
      const requestObjectId = this.mongodb.toObjectId(requestId);
      
      // Prepare update document with updated timestamp
      const updateDoc = {
        ...updateData,
        updatedAt: new Date()
      };
      
      // Update the request
      const result = await this.mongodb.wordRequests.findOneAndUpdate(
        { _id: requestObjectId },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );
      
      // Handle missing document
      if (!result) {
        throw new NotFoundException(`Word request with ID ${requestId} not found`);
      }
      
      return this.mongodb.formatDocument(result.value);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error.name === 'BSONTypeError') {
        throw new BadRequestException(`Invalid request ID: ${requestId}`);
      }
      
      throw new InternalServerErrorException(
        `Error updating word request: ${error.message}`
      );
    }
  }

  /**
   * Accept a word request and create a new word
   * @param requestId - ID of the request to accept
   * @param adminId - ID of the admin accepting the request
   */
  async acceptWordRequest(requestId: string, adminId: string, word: Word) {
    const session = await this.mongodb.startSession();
    
    await this.updateWordRequest(requestId, word);
    try {
      // Convert IDs to ObjectIds
      const requestObjectId = this.mongodb.toObjectId(requestId);
      const adminObjectId = this.mongodb.toObjectId(adminId);
      
      let result;
      
      await session.withTransaction(async () => {
        // 1. Get and validate the request
        const request = await this.mongodb.wordRequests.findOne(
          { _id: requestObjectId },
          { session }
        );
        
        if (!request) {
          throw new NotFoundException(`Word request with ID ${requestId} not found`);
        }
        
        if (request.status !== RequestStatus.PENDING) {
          throw new ForbiddenException(`Word request is not pending (current status: ${request.status})`);
        }
        
        // 2. Create a new word entry using the word parameter instead of request.requestedWordData
        const now = new Date();
        const wordEntryDoc = {
          status: WordStatus.PUBLISHED,
          currentVersion: 1,
          isCreatedFromRequest: true,
          isCreatedFromEdit: false,
          wordRequestId: requestObjectId,
          wordData: word,
          createdAt: now,
          updatedAt: now
        };
        
        // Insert the new word
        const wordEntryResult = await this.mongodb.words.insertOne(
          this.mongodb.prepareDocumentForDB(wordEntryDoc),
          { session }
        );
        
        const wordEntryId = wordEntryResult.insertedId;
        
        // 3. Update the request status
        const updateResult = await this.mongodb.wordRequests.findOneAndUpdate(
          { _id: requestObjectId },
          { 
            $set: {
              status: RequestStatus.ACCEPTED,
              acceptedById: adminObjectId,
              updatedAt: now,
              wordId: wordEntryId,
              activeWordId: wordEntryId
            }
          },
          { 
            returnDocument: 'after', 
            session
          }
        );
        
        if (!updateResult) {
          throw new InternalServerErrorException(`Failed to update word request status for ID ${requestId}`);
        }
        
        result = this.mongodb.formatDocument(updateResult.value);
      });
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      if (error.name === 'BSONTypeError') {
        throw new BadRequestException(
          `Invalid ID format: ${error.message}`
        );
      }
      
      throw new InternalServerErrorException(
        `Error accepting word request: ${error.message}`
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deny a word request
   * @param requestId - ID of the request to deny
   * @param adminId - ID of the admin denying the request
   * @param denyReason - Reason for denial
   */
  async denyWordRequest(requestId: string, adminId: string, denyReason: string) {
    try {
      if (!denyReason || denyReason.trim() === '') {
        throw new BadRequestException('Deny reason is required');
      }
      
      // Convert IDs to ObjectIds
      const requestObjectId = this.mongodb.toObjectId(requestId);
      const adminObjectId = this.mongodb.toObjectId(adminId);
      
      // Get and validate the request
      const request = await this.mongodb.wordRequests.findOne({ _id: requestObjectId });
      
      if (!request) {
        throw new NotFoundException(`Word request with ID ${requestId} not found`);
      }
      
      if (request.status !== RequestStatus.PENDING) {
        throw new ForbiddenException(`Word request is not pending (current status: ${request.status})`);
      }
      
      // Update the request status
      const updateResult = await this.mongodb.wordRequests.findOneAndUpdate(
        { _id: requestObjectId },
        { 
          $set: {
            status: RequestStatus.DENIED,
            denyerId: adminObjectId,
            denyReason,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );
      
      if (!updateResult) {
        throw new InternalServerErrorException(`Failed to update word request status for ID ${requestId}`);
      }
      
      return this.mongodb.formatDocument(updateResult.value);
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException ||
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      if (error.name === 'BSONTypeError') {
        throw new BadRequestException(
          `Invalid ID format: ${error.message}`
        );
      }
      
      throw new InternalServerErrorException(
        `Error denying word request: ${error.message}`
      );
    }
  }
}
