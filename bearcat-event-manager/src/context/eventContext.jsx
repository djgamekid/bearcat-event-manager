import { createContext, useContext, useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from './authContext';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const { currentUser } = useAuth();

  // Fetch events from Firebase
  useEffect(() => {
    const fetchEvents = async () => {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const eventsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsList);
        setLoading(false);
      });

      return () => unsubscribe(); // Cleanup subscription
    };

    fetchEvents();
  }, []);

  // Function to upload image with progress tracking and CORS handling
  const uploadImage = async (file) => {
    try {
      const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
      const metadata = {
        contentType: file.type,
      };
      // First try with uploadBytesResumable
      try {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
            },
            (error) => {
              console.error('Upload error:', error);
              // If CORS error, fall back to uploadBytes
              if (error.code === 'storage/cors-error') {
                console.log('CORS error detected, falling back to uploadBytes');
                uploadBytes(storageRef, file)
                  .then(async (snapshot) => {
                    try {
                      const downloadURL = await getDownloadURL(snapshot.ref);
                      resolve(downloadURL);
                    } catch (error) {
                      console.error('Error getting download URL:', error);
                      reject(error);
                    }
                  })
                  .catch(reject);
              } else {
                reject(error);
              }
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                console.error('Error getting download URL:', error);
                reject(error);
              }
            }
          );
        });
      } catch (error) {
        // If uploadBytesResumable fails, fall back to uploadBytes
        console.log('Falling back to uploadBytes');
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      }
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  // Function to add an event with retry logic
  const addEvent = async (eventData) => {
    try {
      setError(null);
      let imageUrl = null;

      // If there's an image file, upload it first
      if (eventData.image) {
        imageUrl = await uploadImage(eventData.image);
      }

      // Create event document with image URL
      const eventToAdd = {
        ...eventData,
        imageUrl,
        createdAt: new Date().toISOString()
      };

      // Remove the image file from the data before saving to Firestore
      delete eventToAdd.image;

      const docRef = await addDoc(collection(db, 'events'), eventToAdd);
      const newEvent = { id: docRef.id, ...eventToAdd };
      setEvents(prev => [...prev, newEvent]);
      setRetryCount(0); // Reset retry count on success
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      
      // Increment retry count
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      if (newRetryCount >= MAX_RETRIES) {
        setError(`Failed to create event after ${MAX_RETRIES} attempts. Please try again later.`);
        setRetryCount(0); // Reset retry count
        throw new Error(`Failed to create event after ${MAX_RETRIES} attempts`);
      }

      // Wait for 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Retry the operation
      return addEvent(eventData);
    }
  };

  // Update event
  const updateEvent = async (eventId, eventData) => {
    try {
      setError(null);
      let imageUrl = eventData.imageUrl; // Keep existing image URL by default

      // If there's a new image file, upload it
      if (eventData.image) {
        imageUrl = await uploadImage(eventData.image);
      }

      // Update event document with new image URL
      const eventToUpdate = {
        ...eventData,
        imageUrl,
        updatedAt: new Date().toISOString()
      };

      // Remove the image file from the data before saving to Firestore
      delete eventToUpdate.image;

      await updateDoc(doc(db, 'events', eventId), eventToUpdate);
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, ...eventToUpdate } : event
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete event
  const deleteEvent = async (eventId) => {
    try {
      setError(null);
      
      if (!currentUser) {
        throw new Error('You must be logged in to delete events');
      }

      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        throw new Error('Unauthorized: Admin access required to delete events');
      }
      
      // First, get all tickets associated with this event
      const ticketsRef = collection(db, 'tickets');
      const q = query(ticketsRef, where('eventId', '==', eventId));
      const querySnapshot = await getDocs(q);
      
      // Delete all associated tickets
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // Wait for all tickets to be deleted
      await Promise.all(deletePromises);
      
      // Then delete the event
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    events,
    loading,
    error,
    retryCount,
    addEvent,
    updateEvent,
    deleteEvent
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventContext);
}
