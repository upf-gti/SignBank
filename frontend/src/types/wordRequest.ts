
type User = {
    email: string;
    username: string;
}

export type WordRequest = {
    id: number;
    word: string;
    description: string;
    videoUrl: string;
    userId: number;
    status: 'PENDING' | 'APPROVED' | 'DENIED';
    createdAt: string;
    updatedAt: string;
    user?: User
    denyReason?: string
  };