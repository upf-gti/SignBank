export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED',
}

export class UpdateWordRequestDto {
  status: RequestStatus;
  denyReason?: string;
}
