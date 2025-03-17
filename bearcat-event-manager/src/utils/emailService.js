import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const functions = getFunctions();

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    const result = await sendEmailFunction({
      to,
      subject,
      html
    });

    // Return the email ID for tracking
    return result.data.emailId;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email. Please try again later.');
  }
};

// Optional: Add a function to track email status
export const trackEmailStatus = (emailId, callback) => {
  const emailRef = doc(collection(db, 'emails'), emailId);
  
  return onSnapshot(emailRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  }, (error) => {
    console.error('Error tracking email status:', error);
  });
};