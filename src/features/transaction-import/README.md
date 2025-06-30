# Transaction Import Feature

This feature handles importing transactions from CSV/Excel files through a multi-step process with draft status management and automatic cleanup.

## Architecture Overview

The transaction import system uses a **hybrid approach with draft status** to ensure data consistency while providing a smooth user experience.

### Core Components

- **Modal System**: Multi-step modal with URL state management
- **File Upload**: S3-based upload with progress tracking
- **Draft Management**: Creates draft imports that get activated on user confirmation
- **Cleanup Service**: Automatic cleanup of abandoned draft imports

## Database Schema

### `transactionImport` Table
- **Status Flow**: `draft` → `pending` → `processing` → `completed`/`failed`
- **Draft Status**: Created automatically on first file upload
- **Activation**: Changed to `pending` when user clicks "Continue"
- **Cleanup**: Abandoned drafts older than 24 hours are automatically cleaned up

### `transactionImportFile` Table
- **File Records**: Created after successful S3 upload
- **Foreign Key**: References `transactionImport.id` (always exists due to draft creation)
- **S3 Integration**: Stores bucket, key, and file metadata

## Flow Diagram

```
1. User selects account
   ↓
2. User uploads first file
   ├── Creates draft transactionImport (status: 'draft')
   ├── Uploads file to S3
   └── Creates transactionImportFile record
   ↓
3. User uploads additional files (optional)
   ├── Uses existing draft import
   ├── Uploads files to S3
   └── Creates additional transactionImportFile records
   ↓
4. User clicks "Continue"
   ├── Activates draft import (status: 'draft' → 'pending')
   └── Proceeds to processing step
   ↓
5. Background cleanup job
   └── Removes abandoned drafts > 24 hours old
```

## Key Features

### ✅ Draft Status Management
- **Problem**: Need transactionImport record before files, but don't want orphaned records
- **Solution**: Create draft on first upload, activate on user confirmation
- **Benefits**: Database consistency + no orphaned records + audit trail

### ✅ Automatic Cleanup
- **Service**: `TransactionImportCleanupService`
- **Schedule**: Configurable via `DRAFT_IMPORT_CLEANUP_HOURS` (default: 24)
- **Endpoint**: `POST /transaction-import/cleanup` for manual/cron execution

### ✅ S3 Integration
- **Signed URLs**: Secure direct uploads to S3
- **File Tracking**: Database records link to S3 objects
- **Progress**: Real-time upload progress with realistic simulation

## API Endpoints

### Import Records
- `POST /transaction-import/draft` - Create draft import
- `POST /transaction-import/:id/activate` - Activate draft import
- `POST /transaction-import/cleanup` - Cleanup old drafts

### Import Files
- `POST /transaction-import/files/from-s3` - Create file record from S3 upload
- `POST /transaction-import/files/upload/signed-url` - Get S3 signed URL

## Frontend Components

### Hooks
- **`useImportModal()`**: Modal state management with URL persistence
- **`useFileUpload()`**: File upload orchestration with draft creation

### Components
- **`ImportModal`**: Main modal container with step navigation
- **`UploadStep`**: File upload interface with drag & drop
- **`FileList`**: Upload progress and file management

### Store
- **`useFileUploadStore`**: Zustand store for file upload state management

## Environment Variables

```env
# Cleanup configuration
DRAFT_IMPORT_CLEANUP_HOURS=24

# AWS S3 configuration
AWS_BUCKET_NAME_PRIVATE_UPLOAD=your-bucket-name
```

## Error Handling

- **File Validation**: Size limits (10MB), type restrictions (CSV/Excel)
- **Duplicate Prevention**: Files with same ID are rejected
- **Network Errors**: Retry mechanism for failed uploads
- **State Recovery**: Import ID persisted in URL for session recovery

## Security Considerations

- **User Ownership**: All operations verify user ownership of imports
- **Signed URLs**: Temporary S3 access with expiration
- **Cleanup Isolation**: Each user's drafts cleaned independently
- **File Validation**: Server-side validation of all file operations

## Future Enhancements

- **Resume Uploads**: Support for resuming interrupted uploads
- **Batch Processing**: Process multiple files simultaneously
- **File Preview**: In-browser CSV preview before import
- **Progress Webhooks**: Real-time processing status updates
