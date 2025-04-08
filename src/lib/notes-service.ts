import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export interface Note {
  id: string;
  title: string;
  transcript: string;
  notes: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags: string[];
}

export interface CreateNoteInput {
  title: string;
  transcript: string;
  notes: string;
  userId: string;
  tags?: string[];
}

// Ensure tag is non-empty and properly formatted
const sanitizeTag = (tag: string): string => {
  return tag.toLowerCase().trim();
};

const NOTES_COLLECTION = 'notes';

export const notesService = {
  // Create a new note
  async createNote({ title, transcript, notes, userId, tags }: CreateNoteInput): Promise<string> {
    try {
      const sanitizedTags = tags
        ? tags
            .map(tag => sanitizeTag(tag))
            .filter(tag => tag !== '')
        : [];

      const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
        title: title.trim(),
        transcript,
        notes,
        userId,
        tags: sanitizedTags,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  },

  // Get all notes for a user
  async getNotes(userId: string): Promise<Note[]> {
    try {
      const q = query(
        collection(db, NOTES_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Failed to fetch notes');
    }
  },

  // Update a note
  async updateNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('Must be logged in to update notes');
    }

    try {
      const noteRef = doc(db, NOTES_COLLECTION, noteId);
      const noteSnapshot = await getDoc(noteRef);
      
      if (!noteSnapshot.exists()) {
        throw new Error('Note not found');
      }

      const noteData = noteSnapshot.data();
      if (auth.currentUser.uid !== noteData.userId) {
        throw new Error('You do not have permission to edit this note');
      }

      // Validate update data
      if (updates.notes?.trim() === '') {
        throw new Error('Notes content cannot be empty');
      }

      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating note:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update note');
    }
  },

  // Toggle the bookmark status of a note
  async toggleBookmarkStatus(noteId: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('Must be logged in to bookmark notes');
    }

    try {
      const noteRef = doc(db, NOTES_COLLECTION, noteId);
      const noteSnapshot = await getDoc(noteRef);

      if (!noteSnapshot.exists()) {
        throw new Error('Note not found');
      }

      const noteData = noteSnapshot.data();
      if (auth.currentUser.uid !== noteData.userId) {
        throw new Error('You do not have permission to modify this note');
      }

      const currentStatus = noteData.bookmarked || false; // Default to false if not set
      await updateDoc(noteRef, {
        bookmarked: !currentStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling bookmark status:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to toggle bookmark status');
    }
  },

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('Must be logged in to delete notes');
    }

    try {
      const noteRef = doc(db, NOTES_COLLECTION, noteId);
      const noteSnapshot = await getDoc(noteRef);
      
      if (!noteSnapshot.exists()) {
        throw new Error('Note not found');
      }

      const noteData = noteSnapshot.data();
      if (auth.currentUser.uid !== noteData.userId) {
        throw new Error('You do not have permission to delete this note');
      }

      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Error deleting note:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete note');
    }
  },
};