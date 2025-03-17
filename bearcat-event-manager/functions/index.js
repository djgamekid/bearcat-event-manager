const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

// Function to send email
exports.sendEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, subject, html } = data;

  try {
    // Create a new email document in the emails collection
    const emailRef = await admin.firestore().collection('emails').add({
      to,
      subject,
      html,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: context.auth.uid
    });

    // The actual email sending will be handled by the Firebase Extension
    // We just need to create the document with the right format
    await admin.firestore().collection('mail').add({
      to,
      message: {
        subject,
        html
      }
    });

    // Update email status
    await admin.firestore().collection('emails').doc(emailRef.id).update({
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, emailId: emailRef.id };
  } catch (error) {
    console.error('Error sending email:', error);

    // Update email status to failed
    if (emailRef) {
      await admin.firestore().collection('emails').doc(emailRef.id).update({
        status: 'failed',
        error: error.message
      });
    }

    throw new functions.https.HttpsError('internal', 'Error sending email');
  }
});

// Function to handle ticket check-in
exports.checkInTicket = functions.https.onCall(async (data, context) => {
  console.log('context.auth:', context.auth); // This will show the authentication context
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { ticketId, checkInCode } = data;

  try {
    // Get user role
    const adminDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const isAdmin = adminDoc.exists && adminDoc.data().role === 'admin';

    if (!isAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can check in tickets');
    }

    // Get the ticket
    const ticketDoc = await admin.firestore().collection('tickets').doc(ticketId).get();

    if (!ticketDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Ticket not found');
    }

    const ticketData = ticketDoc.data();

    // Verify check-in code
    if (ticketData.checkInCode !== checkInCode) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid check-in code');
    }

    // Check if ticket is already checked in
    if (ticketData.checkedIn) {
      throw new functions.https.HttpsError('already-exists', 'Ticket has already been checked in');
    }

    // Update ticket status
    await admin.firestore().collection('tickets').doc(ticketId).update({
      checkedIn: true,
      checkedInAt: admin.firestore.FieldValue.serverTimestamp(),
      checkedInBy: context.auth.uid,
      status: 'used'
    });

    // Send confirmation email to ticket holder
    const eventDoc = await admin.firestore().collection('events').doc(ticketData.eventId).get();
    const eventData = eventDoc.data();

    const ticketOwnerDoc = await admin.firestore().collection('users').doc(ticketData.userId).get();
    const ticketOwnerData = ticketOwnerDoc.data();

    // Send email using Firebase Extension
    await admin.firestore().collection('mail').add({
      to: ticketOwnerData.email,
      message: {
        subject: `Check-in Confirmation - ${eventData.title}`,
        html: `
          <h1>Check-in Confirmation</h1>
          <p>Your ticket has been successfully checked in for ${eventData.title}.</p>
          <p><strong>Check-in Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Location:</strong> ${eventData.location}</p>
          <p>Thank you for attending!</p>
        `
      }
    });

    return { success: true, ticketId };
  } catch (error) {
    console.error('Error checking in ticket:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
