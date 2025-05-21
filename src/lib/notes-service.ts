import { getFirebaseInstance } from './firebase';
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
  } catch (error) {
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

    return parsedNotes;
  } catch (error) {
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
};

const removeCachedNote = (userId: string, noteId: string) => {
  const cachedData = getFromCache(userId);
  if (!cachedData) return;

  const updatedNotes = cachedData.filter(note => note.id !== noteId);
  saveToCache(userId, updatedNotes);
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

      const { db } = await getFirebaseInstance();
      const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
        title: title.trim(),
        transcript,
        notes,
        userId,
        tags: sanitizedTags,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create new note object
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

      // Update or initialize cache with new note
      const cachedNotes = getFromCache(userId);
      saveToCache(userId, cachedNotes ? [newNote, ...cachedNotes] : [newNote]);

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
      const { auth } = await getFirebaseInstance();
      const userId = auth.currentUser?.uid;
      if (userId) {
        const cachedNotes = getFromCache(userId);
        if (cachedNotes) {
          const cachedNote = cachedNotes.find(note => note.id === noteId);
          if (cachedNote) {
            return cachedNote;
          }
        }
      }

      const { db } = await getFirebaseInstance();
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
        return cachedNotes;
      }

      // If not in cache or expired, fetch from Firebase
      console.log('Cache miss, fetching from Firebase');
      const { db } = await getFirebaseInstance();
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

      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Failed to fetch notes');
    }
  },

  // Update a note
  async updateNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    const { auth } = await getFirebaseInstance();
    if (!auth.currentUser) {
      throw new Error('Must be logged in to update notes');
    }

    try {
      console.log("NotesService - updateNote called with:", { noteId, updates });
      
      const { db } = await getFirebaseInstance();
      const noteRef = doc(db, NOTES_COLLECTION, noteId);
      const noteSnapshot = await getDoc(noteRef);
      
      if (!noteSnapshot.exists()) {
        throw new Error('Note not found');
      }

      const noteData = noteSnapshot.data();
      console.log("NotesService - Current note data:", noteData);
      
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

      console.log("NotesService - Sending update to Firebase:", firebaseUpdate);
      await updateDoc(noteRef, firebaseUpdate);
      console.log("NotesService - Firebase update successful");

      // Update cache with Timestamp instead of FieldValue
      const cacheUpdate = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      console.log("NotesService - Updating cache with:", cacheUpdate);
      updateCacheForNote(auth.currentUser.uid, noteId, cacheUpdate);
      console.log("NotesService - Cache update completed");
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
    const { auth } = await getFirebaseInstance();
    if (!auth.currentUser) {
      throw new Error('Must be logged in to bookmark notes');
    }

    try {
      const { db } = await getFirebaseInstance();
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
    const { auth } = await getFirebaseInstance();
    if (!auth.currentUser) {
      throw new Error('Must be logged in to delete notes');
    }

    try {
      const { db } = await getFirebaseInstance();
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
  }
};