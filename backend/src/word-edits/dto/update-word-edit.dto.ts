export enum EditStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateWordEditDto {
  status: EditStatus;
  denyReason?: string; // If rejected, reason why
  applyChanges?: boolean; // If approved, whether to apply the changes immediately
} 