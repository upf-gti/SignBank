# Word Edits Module

This module handles the submission, review, and application of edits to existing words in the LSC SignBank.

## Purpose

The Word Edits module implements a collaborative editing workflow that allows:
1. Users to suggest changes to existing words
2. Administrators to review those changes
3. Changes to be applied to words after approval

## Database Structure

The module works with the `WordEdit` model in the database schema which tracks:
- The word being edited
- The user suggesting the edit
- The specific changes (stored as JSON)
- The status of the edit (pending, approved, rejected)
- Comments explaining the edit
- Rejection reasons (if applicable)

## API Endpoints

### User Endpoints

- `POST /word-edits` - Submit a new edit for a word
- `GET /word-edits/user` - View your submitted edits
- `GET /word-edits/:id` - View details of a specific edit

### Admin Endpoints

- `GET /word-edits` - List all edits (filterable by status)
- `PATCH /word-edits/:id` - Approve or reject an edit

## Workflow

1. **Edit Submission**:
   - User identifies a word that needs correction or enhancement
   - User submits an edit with the proposed changes
   - Edit is saved with status `PENDING`

2. **Review Process**:
   - Administrator reviews pending edits
   - Administrator can approve or reject each edit
   - If rejected, a reason can be provided

3. **Change Application**:
   - When approving an edit, the `applyChanges` flag determines if changes are applied immediately
   - If true, the changes are applied to the word and it's reindexed in the search engine
   - If false, the edit is marked as approved but must be applied manually

## Data Structures

### CreateWordEditDto
```typescript
{
  wordId: number;        // ID of the word to edit
  editData: object;      // JSON object with changes
  comment?: string;      // Optional explanation
}
```

### UpdateWordEditDto
```typescript
{
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  denyReason?: string;   // If rejected
  applyChanges?: boolean; // If approved, whether to apply immediately
}
```

## Implementation Notes

The module handles the complexities of:
- Storing edit history for auditing
- Managing the approval workflow
- Safely applying JSON patches to word data
- Maintaining search index consistency 