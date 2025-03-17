import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTickets } from '../../context/ticketContext';
import { useEvents } from '../../context/eventContext';
import { useAuth } from '../../context/authContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Navbar from '../../components/navbar';
import { Html5QrcodeScanner } from 'html5-qrcode';

function AdminCheckIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  const { events } = useEvents();
  const { isAdmin } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [checkInCode, setCheckInCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [lastCheckedIn, setLastCheckedIn] = useState(null);

  const functions = getFunctions();
  const checkInTicketFunction = httpsCallable(functions, 'checkInTicket');

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Set selected event from URL parameter
  useEffect(() => {
    if (eventId) {
      setSelectedEvent(eventId);
    }
  }, [eventId]);

  // Filter active events
  const activeEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate >= now;
  });

  // Initialize QR Scanner
  useEffect(() => {
    let html5QrcodeScanner;

    if (showScanner) {
      // First check if camera access is available
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setTimeout(() => {
            const readerElement = document.getElementById("qr-reader");
            if (!readerElement) {
              console.error("QR Reader element not found");
              setError("Scanner initialization failed. Please try again.");
              return;
            }

            html5QrcodeScanner = new Html5QrcodeScanner(
              "qr-reader",
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 2,
                videoConstraints: {
                  facingMode: "environment",
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 }
                },
                formatsToSupport: [ "QR_CODE" ]
              },
              false // verbose mode off for better performance
            );

            html5QrcodeScanner.render(
              async (decodedText) => {
                console.log("Scanned:", decodedText);
                try {
                  const [scannedEventId, scannedCode] = decodedText.split(":");
                  if (scannedEventId && scannedCode) {
                    if (selectedEvent && scannedEventId !== selectedEvent) {
                      setError("This ticket is for a different event");
                      return;
                    }
                    await handleCheckIn(scannedEventId, scannedCode);
                    html5QrcodeScanner.clear();
                    setShowScanner(false);
                  } else {
                    setError("Invalid ticket format");
                  }
                } catch (err) {
                  console.error("Scan processing error:", err);
                  setError("Failed to process scan. Please try again.");
                }
              },
              (errorMessage) => {
                // Ignore "NotFound" errors as they're just indicating no QR code is currently visible
                if (!errorMessage.includes("NotFound")) {
                  console.error("Scanner error:", errorMessage);
                  if (errorMessage.includes("Camera access denied")) {
                    setError("Please allow camera access to use the scanner");
                  } else {
                    setError("Scanner error - please try again");
                  }
                }
              }
            ).catch(err => {
              console.error("Scanner initialization error:", err);
              setError("Failed to start scanner. Please try again.");
            });
          }, 100);
        })
        .catch(err => {
          console.error("Camera access error:", err);
          setError("Camera access denied. Please check your browser settings.");
        });
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch((error) => {
          console.error("Scanner cleanup error:", error);
        });
      }
    };
  }, [showScanner, selectedEvent]);
  

  const handleCheckIn = async (eventId, code) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Find ticket by check-in code
      const ticketsRef = collection(db, 'tickets');
      const q = query(
        ticketsRef,
        where('eventId', '==', eventId),
        where('checkInCode', '==', code)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid check-in code or ticket not found');
      }

      const ticketDoc = querySnapshot.docs[0];
      const ticketData = ticketDoc.data();

      // Call the Cloud Function to check in the ticket
      const result = await checkInTicketFunction({
        ticketId: ticketDoc.id,
        checkInCode: code
      });

      if (result.data.success) {
        setSuccess('Ticket checked in successfully!');
        setCheckInCode('');
        setLastCheckedIn({
          ...ticketData,
          id: ticketDoc.id,
          checkedInAt: new Date().toLocaleString()
        });
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.message || 'An error occurred during check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!selectedEvent || !checkInCode) {
      setError('Please select an event and enter a check-in code');
      return;
    }

    await handleCheckIn(selectedEvent, checkInCode.toUpperCase());
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin')}
              className="btn btn-ghost btn-circle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Event Check-In</h1>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6">
              <span>{success}</span>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title mb-4">Check In Tickets</h2>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Select Event</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  <option value="">Select an event</option>
                  {activeEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Check-in Code</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter check-in code"
                  className="input input-bordered w-full"
                  value={checkInCode}
                  onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className="flex gap-4">
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleManualCheckIn}
                  disabled={loading || !selectedEvent || !checkInCode}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    'Check In'
                  )}
                </button>
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => setShowScanner(!showScanner)}
                >
                  {showScanner ? 'Hide Scanner' : 'Scan QR Code'}
                </button>
              </div>
            </div>
          </div>

          {showScanner && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title mb-4">QR Code Scanner</h2>
                <div id="qr-reader" className="w-full"></div>
              </div>
            </div>
          )}

          {lastCheckedIn && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-success">Last Checked In Ticket</h2>
                <div className="space-y-2">
                  <p><strong>Check-in Time:</strong> {lastCheckedIn.checkedInAt}</p>
                  <p><strong>Ticket Code:</strong> {lastCheckedIn.checkInCode}</p>
                  <p><strong>Status:</strong> <span className="badge badge-success">Checked In</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminCheckIn; 