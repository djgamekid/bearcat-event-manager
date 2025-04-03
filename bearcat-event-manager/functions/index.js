const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

// Function to send email
exports.sendEmail = functions.https.onCall({
  region: "us-central1",  // Specify your region
}, async (request) => {
  const { data, auth } = request;

  // Check if user is authenticated
  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, subject, html } = data;
  let emailRef;

  try {
    // Create a new email document in the emails collection
    emailRef = await admin.firestore().collection('emails').add({
      to,
      subject,
      html,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: auth.uid  // Use auth.uid instead of context.auth.uid
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
exports.checkInTicket = functions.https.onCall({
  region: "us-central1",   // Specify your region
}, async (request) => {
  const { data, auth } = request;
  console.log('Function called with data:', data);
  console.log('Authentication context:', auth);

  // Verify authentication with more descriptive error
  if (!auth) {
    console.error('Authentication missing in request:', request);
    throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to check in tickets. Please log out and log in again.'
    );
  }

  const { ticketId, checkInCode } = data;

  // Rest of your function remains the same but use auth instead of context.auth
  console.log(`Processing check-in for ticket ${ticketId} with code ${checkInCode}`);

  try {
    // Get user role - use auth.uid instead of context.auth.uid
    const adminDoc = await admin.firestore().collection('users').doc(auth.uid).get();

    if (!adminDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    const userData = adminDoc.data();
    const isAdmin = userData && (userData.role === 'admin' || userData.role === 'ADMIN');

    console.log('User role check:', userData.role, 'isAdmin:', isAdmin);

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
      checkedInBy: auth.uid, // Use auth.uid instead of context.auth.uid
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

    // Return success
    return { success: true, message: 'Ticket checked in successfully' };
  } catch (error) {
    console.error('Check-in error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
