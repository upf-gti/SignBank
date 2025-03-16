export class CreateWordEditDto {
  wordId: number;
  editData: Record<string, any>; // JSON data of the fields being edited
  comment?: string;
} 