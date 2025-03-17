import { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './authContext';
import QRCode from 'qrcode';
import { sendEmail, trackEmailStatus } from '../utils/emailService';

const TicketContext = createContext();

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isAdmin } = useAuth();

  // Fetch user's tickets
  useEffect(() => {
    if (!currentUser) {
      setTickets([]);
      setLoading(false);
      return;
    }

    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tickets:', error);
      setError('Failed to fetch tickets. Please try again later.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Generate a random check-in code
  const generateCheckInCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Purchase tickets
  const purchaseTickets = async (eventId, quantity) => {
    try {
      setError(null);
      setLoading(true);

      if (!currentUser) {
        throw new Error('You must be logged in to purchase tickets');
      }

      // Get event details
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const event = { id: eventDoc.id, ...eventDoc.data() };

      // Check if enough tickets are available
      if (event.ticketsAvailable < quantity) {
        throw new Error('Not enough tickets available');
      }

      // Create new tickets
      const ticketsRef = collection(db, 'tickets');
      const ticketPromises = Array(quantity).fill().map(async () => {
        const checkInCode = generateCheckInCode();
        // Create a simple string format that's easier to scan
        const qrCodeData = `${eventId}:${checkInCode}`;
        
        // Generate QR code with simpler settings for better mobile compatibility
        const qrCode = await QRCode.toDataURL(qrCodeData, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 256,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        
        const ticketData = {
          eventId,
          userId: currentUser.uid,
          purchaseDate: new Date().toISOString(),
          checkInCode,
          qrCode,
          qrCodeData,
          status: 'active',
          checkedIn: false,
          checkedInAt: null,
          checkedInBy: null
        };

        const ticketDoc = await addDoc(ticketsRef, ticketData);
        return { id: ticketDoc.id, ...ticketData };
      });

      const newTickets = await Promise.all(ticketPromises);

      // Update event's available tickets
      await updateDoc(eventRef, {
        ticketsAvailable: event.ticketsAvailable - quantity,
        ticketsSold: (event.ticketsSold || 0) + quantity
      });

      // Send confirmation email
      try {
        const emailId = await sendEmail({
          to: currentUser.email,
          subject: `Ticket Confirmation - ${event.title}`,
          html: `
            <h1>Your Tickets for ${event.title}</h1>
            <p>Thank you for your purchase!</p>
            <p><strong>Event Details:</strong></p>
            <ul>
              <li>Date: ${new Date(event.date).toLocaleDateString()}</li>
              <li>Time: ${new Date(event.date).toLocaleTimeString()}</li>
              <li>Location: ${event.location}</li>
            </ul>
            <div style="margin: 20px 0;">
              ${newTickets.map((ticket, index) => `
                <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
                  <h3>Ticket #${index + 1}</h3>
                  <p>Check-in Code: <strong>${ticket.checkInCode}</strong></p>
                  <img src="${ticket.qrCode}" alt="Ticket QR Code" style="max-width: 200px;"/>
                </div>
              `).join('')}
            </div>
            <p>Please keep your QR codes and check-in codes safe. You'll need them to enter the event.</p>
          `
        });

        // Track email status
        trackEmailStatus(emailId, (status) => {
          console.log('Email status:', status);
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't throw here as tickets were created successfully
      }

      return newTickets;
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check in a ticket
  const checkInTicket = async (checkInCode) => {
    try {
      if (!isAdmin) {
        throw new Error('Only admins can check in tickets');
      }

      // Find ticket by check-in code
      const ticketsRef = collection(db, 'tickets');
      const q = query(ticketsRef, where('checkInCode', '==', checkInCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid check-in code');
      }

      const ticketDoc = querySnapshot.docs[0];
      const ticketData = ticketDoc.data();

      if (ticketData.checkedIn) {
        throw new Error('Ticket has already been checked in');
      }

      // Update ticket status
      await updateDoc(ticketDoc.ref, {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy: currentUser.uid,
        status: 'used'
      });

      return { id: ticketDoc.id, ...ticketData };
    } catch (error) {
      console.error('Error checking in ticket:', error);
      throw error;
    }
  };

  const value = {
    tickets,
    loading,
    error,
    purchaseTickets,
    checkInTicket
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketContext);
} 