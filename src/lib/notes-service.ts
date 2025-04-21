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
  bookmarked?: boolean;
}

// Cache configuration
interface CacheData {
  notes: Array<Omit<Note, 'createdAt' | 'updatedAt'> & {
    createdAt: { seconds: number; nanoseconds: number };
    updatedAt: { seconds: number; nanoseconds: number };
  }>;
  timestamp: number;
  version: number;
}

// Convert Firestore Timestamp to cache-safe format
const timestampToCache = (timestamp: Timestamp) => ({
  seconds: timestamp.seconds,
  nanoseconds: timestamp.nanoseconds,
});

// Convert cache timestamp back to Firestore Timestamp
const cacheToTimestamp = (cache: { seconds: number; nanoseconds: number }) =>
  new Timestamp(cache.seconds, cache.nanoseconds);

export interface CreateNoteInput {
  title: string;
  transcript: string;
  notes: string;
  userId: string;
  tags?: string[];
}

// Cache configuration
const CACHE_KEY = 'notes_cache';
const CACHE_EXPIRY = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds


const CACHE_VERSION = 1; // Increment when cache structure changes

const sanitizeTag = (tag: string): string => {
  return tag.toLowerCase().trim();
};

const NOTES_COLLECTION = 'notes';

// Cache management functions
const saveToCache = (userId: string, notes: Note[]) => {
  const cacheData: CacheData = {
    notes: notes.map(note => ({
      ...note,
      createdAt: timestampToCache(note.createdAt),
      updatedAt: timestampToCache(note.updatedAt),
    })),
    timestamp: Date.now(),
    version: CACHE_VERSION
  };
  try {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(cacheData));
    console.log('Cache updated:', new Date().toISOString());
  } catch (error) {
    console.error('Error saving to cache:', error);
    // Clear cache if storage is full
    localStorage.removeItem(`${CACHE_KEY}_${userId}`);
  }
};

const getFromCache = (userId: string): Note[] | null => {
  try {
    const cachedData = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (!cachedData) return null;

    const { notes, timestamp, version }: CacheData = JSON.parse(cachedData);
    
    // Version check for cache structure updates
    if (version !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_KEY}_${userId}`);
      return null;
    }
    
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`${CACHE_KEY}_${userId}`);
      return null;
    }

    // Convert cached timestamps back to Firestore Timestamps
    const parsedNotes = notes.map(note => ({
      ...note,
      createdAt: cacheToTimestamp(note.createdAt),
      updatedAt: cacheToTimestamp(note.updatedAt),
    }));

    console.log('Cache hit:', new Date().toISOString());
    return parsedNotes;
  } catch (error) {
    console.error('Error reading from cache:', error);
    localStorage.removeItem(`${CACHE_KEY}_${userId}`);
    return null;
  }
};

const updateCacheForNote = (userId: string, noteId: string, updatedFields: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>) => {
  const cachedData = getFromCache(userId);
  if (!cachedData) return;

  const updatedNotes = cachedData.map(note => 
    note.id === noteId 
      ? { 
          ...note, 
          ...updatedFields,
          updatedAt: Timestamp.now() // Use Timestamp.now() for cache
        } 
      : note
  );
  
  saveToCache(userId, updatedNotes);
  console.log('Cache updated for note:', noteId);
};

const removeCachedNote = (userId: string, noteId: string) => {
  const cachedData = getFromCache(userId);
  if (!cachedData) return;

  const updatedNotes = cachedData.filter(note => note.id !== noteId);
  saveToCache(userId, updatedNotes);
  console.log('Note removed from cache:', noteId);
};

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

      // Update cache with new note
      const cachedNotes = getFromCache(userId);
      if (cachedNotes) {
        const newNote = {
          id: docRef.id,
          title: title.trim(),
          transcript,
          notes,
          userId,
          tags: sanitizedTags,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        saveToCache(userId, [newNote, ...cachedNotes]);
        console.log('New note added to cache:', docRef.id);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  },

  // Get a single note by ID
  async getNote(noteId: string): Promise<Note | null> {
    try {
      // Check cache first
      const userId = auth.currentUser?.uid;
      if (userId) {
        const cachedNotes = getFromCache(userId);
        if (cachedNotes) {
          const cachedNote = cachedNotes.find(note => note.id === noteId);
          if (cachedNote) {
            console.log('Note retrieved from cache:', noteId);
            return cachedNote;
          }
        }
      }

      const noteRef = doc(db, NOTES_COLLECTION, noteId);
      const noteSnapshot = await getDoc(noteRef);
      
      if (!noteSnapshot.exists()) {
        return null;
      }
      
      return {
        id: noteSnapshot.id,
        ...noteSnapshot.data()
      } as Note;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error('Failed to fetch note');
    }
  },

  // Get all notes for a user
  async getNotes(userId: string): Promise<Note[]> {
    try {
      // Check cache first
      const cachedNotes = getFromCache(userId);
      if (cachedNotes) {
        console.log('Notes retrieved from cache, count:', cachedNotes.length);
        return cachedNotes;
      }

      // If not in cache or expired, fetch from Firebase
      console.log('Cache miss, fetching from Firebase');
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

      // Save to cache
      saveToCache(userId, notes);
      console.log('Notes cached, count:', notes.length);

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

      const firebaseUpdate = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(noteRef, firebaseUpdate);

      // Update cache with Timestamp instead of FieldValue
      const cacheUpdate = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      updateCacheForNote(auth.currentUser.uid, noteId, cacheUpdate);
      console.log('Note updated in cache:', noteId);
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

      const currentStatus = noteData.bookmarked || false;
      
      // Update Firebase
      const firebaseUpdate = {
        bookmarked: !currentStatus,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(noteRef, firebaseUpdate);

      // Update cache with Timestamp instead of FieldValue
      const cacheUpdate = {
        bookmarked: !currentStatus,
        updatedAt: Timestamp.now(),
      };
      updateCacheForNote(auth.currentUser.uid, noteId, cacheUpdate);
      console.log('Bookmark status updated in cache:', noteId);
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

      // Remove from cache
      removeCachedNote(auth.currentUser.uid, noteId);
      console.log('Note removed from cache:', noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete note');
    }
  },

  // Clear user's cache (useful for logout)
  clearCache(userId: string): void {
    localStorage.removeItem(`${CACHE_KEY}_${userId}`);
    console.log('Cache cleared for user:', userId);
  }
};
