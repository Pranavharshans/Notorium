export interface Note {
  id: string;
  transcript: string;
  notes: string;
  createdAt: any; // TODO: Use proper Firebase timestamp type
  updatedAt: any;
  tags?: string[];
  title?: string;
  userId?: string;
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