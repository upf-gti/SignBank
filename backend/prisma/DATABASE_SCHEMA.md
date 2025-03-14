# LSC SignBank Database Schema Documentation

This document provides a comprehensive overview of the database schema for the LSC SignBank project, a digital repository for Catalan Sign Language (LSC).

## Overview

The LSC SignBank database is designed to store and manage sign language entries with rich linguistic information, including videos, phonological annotations, translations, and relationships between signs. The schema supports the complex nature of sign languages by capturing various aspects such as movement types, non-manual components, and dialectal variations. It also implements a complete workflow system for word creation, editing, and approval.

## Database Models

### Users
Manages user accounts and authentication in the system.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| username | String | Unique username |
| email | String | Unique email address |
| password | String | Encrypted password |
| role | Role | User role (ADMIN or USER) |
| createdAt | DateTime | Account creation timestamp |
| wordRequests | Relation | User's word requests |
| words | Relation | Words created by this user |
| wordEdits | Relation | Word edits submitted by this user |

### Words
The central model of the database, representing sign language glosses with detailed linguistic annotations.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| word | String | The gloss or written representation of the sign |
| description | String | General description of the sign |
| createdAt | DateTime | Entry creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| status | WordStatus | Publication status (PENDING, PUBLISHED, ARCHIVED) |
| creatorId | Int | Foreign key to the user who created this word |
| requestId | Int? | Optional reference to the original word request |
| dialectId | Int? | Optional reference to a specific dialect |
| isNative | Boolean | Whether the sign is native to LSC or borrowed |
| movementType | String? | Type of movement (rectilinear, circular, etc.) |
| hasContact | Boolean? | Whether the sign involves contact |
| facialExpression | String? | Description of facial expressions |
| nonManualComponents | String? | Other non-manual components of the sign |
| dominantHand | Hand? | Dominant hand used in the sign |
| morphologicalVariants | String? | Description of morphological variations |
| phonologicalTranscription | String? | Phonological transcription (HamNoSys, SignWriting) |
| lexicalCategory | LexicalCategory? | Grammatical category of the sign |
| register | String? | Usage register (formal, colloquial, etc.) |
| usageFrequency | String? | Frequency of use |
| usageEra | String? | Era when the sign is/was commonly used |

### WordEdit
Tracks proposed edits to existing words, allowing for a review process.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| wordId | Int | Foreign key to the word being edited |
| editorId | Int | Foreign key to the user who submitted the edit |
| editData | Json | JSON data containing all fields being modified |
| comment | String? | Optional comment explaining the edit |
| status | EditStatus | Current status of the edit (PENDING, APPROVED, REJECTED) |
| denyReason | String? | Optional reason if the edit was rejected |
| createdAt | DateTime | Edit submission timestamp |
| updatedAt | DateTime | Last update timestamp |

### Video
Stores video recordings of signs from different angles for comprehensive visualization.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| url | String | URL to the video resource |
| angle | String | Camera angle or perspective |
| wordId | Int | Foreign key to the associated sign |
| createdAt | DateTime | Video creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Dialect
Represents regional variations of LSC with geographical data.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| name | String | Name of the dialect or variation |
| region | String | Geographical region |
| mapCoordinates | String? | Optional coordinates for map visualization |
| description | String? | Optional description of the dialect |
| createdAt | DateTime | Entry creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Sense
Captures different meanings or senses of a sign, similar to dictionary definitions.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| definition | String | Definition of this sense |
| example | String? | Optional example of usage |
| wordId | Int | Foreign key to the associated sign |
| createdAt | DateTime | Entry creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Translation
Stores translations of signs in multiple languages.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| text | String | Translation text |
| language | Language | Language of the translation |
| wordId | Int | Foreign key to the associated sign |
| createdAt | DateTime | Entry creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### WordRelation
Creates a semantic network of relationships between signs.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| sourceWordId | Int | Foreign key to the source sign |
| targetWordId | Int | Foreign key to the target sign |
| relationType | RelationType | Type of relationship |
| createdAt | DateTime | Entry creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### WordRequest
Manages requests from users to add new signs to the database.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-incremented |
| word | String | Requested gloss/sign |
| description | String | Description of the requested sign |
| videoUrl | String | URL to the video demonstrating the sign |
| userId | Int | Foreign key to the requesting user |
| status | RequestStatus | Status of the request |
| denyReason | String? | Optional reason for denial |
| createdAt | DateTime | Request creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| createdWord | Relation | Reference to the word created from this request (if accepted) |

## Enumerations

### Role
Defines user roles in the system.
- `ADMIN`: Administrative user with elevated privileges
- `USER`: Standard user

### RequestStatus
Tracks the status of word requests.
- `PENDING`: Request awaiting review
- `ACCEPTED`: Request approved and added to the database
- `DENIED`: Request rejected

### WordStatus
Tracks the publication status of words.
- `PENDING`: Word awaiting review and approval
- `PUBLISHED`: Word approved and publicly visible
- `ARCHIVED`: Word no longer in active use

### EditStatus
Tracks the status of proposed edits.
- `PENDING`: Edit awaiting review
- `APPROVED`: Edit approved and applied to the word
- `REJECTED`: Edit rejected

### Language
Supported languages for translations.
- `CATALAN`: Catalan language
- `SPANISH`: Spanish language
- `ENGLISH`: English language
- `OTHER`: Other languages

### LexicalCategory
Grammatical categories for linguistic classification.
- `NOUN`
- `VERB`
- `ADJECTIVE`
- `ADVERB`
- `PRONOUN`
- `DETERMINER`
- `PREPOSITION`
- `CONJUNCTION`
- `INTERJECTION`
- `OTHER`

### RelationType
Types of relationships between signs.
- `SYNONYM`: Signs with identical or similar meanings
- `REGIONAL_VARIANT`: Dialectal variations of the same sign
- `ASSOCIATED_CONCEPT`: Conceptually related signs
- `ANTONYM`: Signs with opposite meanings
- `HYPERNYM`: More general category signs
- `HYPONYM`: More specific instance signs

### Hand
Dominant hand used in a sign.
- `RIGHT`: Right hand dominant
- `LEFT`: Left hand dominant
- `BOTH`: Both hands equally active

## Relationships

- Each `Word` is created by a specific `User` (creator relationship)
- Each `Word` can optionally originate from a `WordRequest`
- Each `Word` can have multiple `WordEdit` entries tracking proposed changes
- Each `Word` can have multiple `Video` entries showing different angles
- Each `Word` can have multiple `Sense` entries for different meanings
- Each `Word` can have multiple `Translation` entries in different languages
- Words can be related to other words through the `WordRelation` table
- Each `Word` can optionally belong to a `Dialect`
- `Users` can submit `WordRequest` entries to propose new signs
- `Users` can submit `WordEdit` entries to propose changes to existing signs

## Content Workflows

The schema supports three main workflows:

1. **Word Creation Workflow**:
   - User submits a `WordRequest`
   - Admin reviews the request
   - If approved, a new `Word` entry is created with status PENDING and linked to the original request
   - Admin reviews the word and can publish it (PUBLISHED) or keep it pending

2. **Word Editing Workflow**:
   - User submits edit suggestions through `WordEdit`
   - Admin reviews the proposed edits
   - If approved, edits are applied to the `Word` entry

3. **Word Lifecycle Management**:
   - Words progress through states: PENDING → PUBLISHED → ARCHIVED
   - Archiving allows for tracking historical signs no longer in common use

## Design Considerations

1. **Comprehensive Linguistic Data**: The schema is designed to capture the complex linguistic features of sign languages, including phonological elements, non-manual components, and morphological variations.

2. **Multi-angle Video Support**: Multiple videos per sign allow for comprehensive visual documentation from different perspectives.

3. **Rich Semantic Network**: The WordRelation model creates an interconnected network of signs, enabling users to navigate between related concepts.

4. **Dialectal Variation Support**: The Dialect model captures regional variations, important for documenting the diversity within LSC.

5. **Translation and Sense Support**: Multiple translations and senses allow for comprehensive multilingual and semantic documentation.

6. **Collaborative Content Management**: The integrated WordRequest and WordEdit models enable community participation while maintaining quality through systematic review and approval processes.

7. **Content History**: All edits are tracked, providing a rich historical record of how signs evolve over time.

## Database Indexing

The schema includes several unique constraints and indexes:
- Unique usernames and emails in the Users table
- Unique combination of wordId and language in the Translation table
- Unique combination of sourceWordId, targetWordId, and relationType in the WordRelation table
- Unique requestId in the Words table to ensure a one-to-one relationship with WordRequest

## Notes on Usage

- All timestamp fields (`createdAt`, `updatedAt`) are automatically managed
- Cascade deletion is implemented for related entities where appropriate
- Many fields are optional (`?`) to allow for incomplete data during the documentation process
- JSON data in WordEdit.editData should follow a consistent structure to facilitate automatic application of approved edits 