import { HttpException } from '@nestjs/common';
import axios from 'axios';
import { VideosService } from './videos.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VideosService Drive streaming', () => {
  const originalApiKey = process.env.GOOGLE_DRIVE_API_KEY;
  let service: VideosService;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedAxios.isAxiosError = axios.isAxiosError;
    process.env.GOOGLE_DRIVE_API_KEY = 'test-key';
    service = new VideosService();
  });

  afterAll(() => {
    process.env.GOOGLE_DRIVE_API_KEY = originalApiKey;
  });

  it('does not delete Google Drive files from Dufs', async () => {
    await expect(
      service.deleteVideo(
        'https://drive.google.com/file/d/1f8YqJU_Lne5Az0o8gyAR1CAPKE3CbA8x/view?usp=sharing',
      ),
    ).resolves.toBeUndefined();
    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });

  it('rejects invalid Drive file ids', async () => {
    await expect(
      service.streamDriveVideo(
        '../nope',
        { headers: {}, on: jest.fn() } as never,
        {} as never,
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('fails closed when the API key is missing', async () => {
    delete process.env.GOOGLE_DRIVE_API_KEY;
    service = new VideosService();

    try {
      await service.streamDriveVideo(
        '1f8YqJU_Lne5Az0o8gyAR1CAPKE3CbA8x',
        { headers: {}, on: jest.fn() } as never,
        {} as never,
      );
      throw new Error('expected streamDriveVideo to reject');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(503);
    }
  });
});
