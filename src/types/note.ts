export interface Note {
  id: string;
  transcript: string;
  notes: string;
  createdAt: { seconds: number; nanoseconds?: number } | Date;
  updatedAt: { seconds: number; nanoseconds?: number } | Date;
  tags?: string[];
  title?: string;
  userId?: string;
  bookmarked?: boolean;
}

export interface CreateNoteInput {
  transcript: string;
  notes: string;
  userId: string;
  tags?: string[];
}

export interface UpdateNoteInput extends Partial<Omit<Note, 'id'>> {
  id: string;
}