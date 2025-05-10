# Word Requests Module

This module handles user requests to add new words to the LSC SignBank database.

## Implementation Notes

### Current Implementation

The current implementation follows a simplified flow where:

1. Users submit word requests with basic information (word, definition, videoUrl).
2. Admins review these requests and can approve or deny them.
3. When a request is approved, a new Word entry is created with the information from the request.

### Future Integration with Enhanced Schema

The database schema has been enhanced to support a more sophisticated workflow with:

- Bidirectional relationship between WordRequest and Words
- User ownership of Words
- Edit tracking and approval workflows

When the Prisma schema is fully migrated and available throughout the codebase, the `updateStatus` method in `word-requests.service.ts` should be updated to:

```typescript
async updateStatus(requestId: number, dto: UpdateWordRequestDto, adminId: number) {
  return this.prisma.$transaction(async (tx) => {
    // Update the request status
    const request = await tx.wordRequest.update({
      where: { id: requestId },
      data: { 
        status: dto.status,
        denyReason: dto.denyReason 
      },
    });

    // If request is accepted and createWord flag is true, create a new word
    if (dto.status === 'ACCEPTED' && dto.createWord !== false) {
      // Create the word with proper schema relationships
      const newWord = await tx.words.create({
        data: {
          word: request.word,
          definition: request.definition,
          status: 'PENDING',  // Default status for new words
          // Connect to the admin as creator
          creator: {
            connect: { id: adminId }
          },
          // Link back to the original request
          originalRequest: {
            connect: { id: requestId }
          }
        },
      });
      
      // Create video if there's a videoUrl
      if (request.videoUrl) {
        await tx.video.create({
          data: {
            url: request.videoUrl,
            angle: 'front',
            word: {
              connect: { id: newWord.id }
            }
          }
        });
      }

      // Index in Typesense
      await this.typesenseSync.syncSingleWord(newWord);
      
      return {
        ...request,
        createdWord: newWord
      };
    }

    return request;
  });
}
```

## API Endpoints

- `POST /word-requests` - Submit a new word request
- `GET /word-requests` - Get current user's word requests
- `GET /word-requests/pending` - (Admin only) Get all pending word requests
- `PATCH /word-requests/:id` - (Admin only) Update the status of a word request

## Data Flow

1. User submits a request via `POST /word-requests`
2. Admin reviews the request via `GET /word-requests/pending`
3. Admin approves/denies via `PATCH /word-requests/:id`
4. If approved, a new Word is created and linked to the request

## Implementation Details

The `UpdateWordRequestDto` includes a `createWord` flag to indicate whether a word should be created when approving a request. This allows flexibility in the workflow. 