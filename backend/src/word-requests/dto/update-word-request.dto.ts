export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED',
}

export class UpdateWordRequestDto {
  status: RequestStatus;
  denyReason?: string;
  
  // Optional data for creating word when accepting a request
  createWord?: boolean; // Flag to indicate if word should be created
}
