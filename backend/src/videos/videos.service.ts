import { Injectable, NotFoundException } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { Video } from '../../types/database';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideosService {
  constructor(private readonly mongodb: MongoDBService) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    const now = new Date();
    const videoDoc = {
      ...createVideoDto,
      createdAt: now,
      updatedAt: now
    };

    const result = await this.mongodb.videos.insertOne(
      this.mongodb.prepareDocumentForDB(videoDoc)
    );

    return this.mongodb.formatDocument<Video>({
      ...videoDoc,
      _id: result.insertedId
    });
  }

  async findAll(): Promise<Video[]> {
    const videos = await this.mongodb.videos.find().toArray();
    return videos.map(video => this.mongodb.formatDocument<Video>(video));
  }

  async findOne(id: string): Promise<Video> {
    const objectId = this.mongodb.toObjectId(id);
    const video = await this.mongodb.videos.findOne({ _id: objectId });

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    return this.mongodb.formatDocument<Video>(video);
  }

  async findByIds(ids: string[]): Promise<Video[]> {
    const objectIds = ids.map(id => this.mongodb.toObjectId(id));
    const videos = await this.mongodb.videos.find({ _id: { $in: objectIds } }).toArray();
    return videos.map(video => this.mongodb.formatDocument<Video>(video));
  }

  async update(id: string, updateVideoDto: Partial<CreateVideoDto>): Promise<Video> {
    const objectId = this.mongodb.toObjectId(id);
    const updateDoc = {
      ...updateVideoDto,
      updatedAt: new Date()
    };

    const result = await this.mongodb.videos.findOneAndUpdate(
      { _id: objectId },
      { $set: this.mongodb.prepareDocumentForDB(updateDoc) },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    return this.mongodb.formatDocument<Video>(result.value);
  }

  async remove(id: string): Promise<Video> {
    const objectId = this.mongodb.toObjectId(id);
    const result = await this.mongodb.videos.findOneAndDelete({ _id: objectId });

    if (!result.value) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    return this.mongodb.formatDocument<Video>(result.value);
  }
} 