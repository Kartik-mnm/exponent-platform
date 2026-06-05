// ============================================================
// FCM (Firebase Cloud Messaging) — Attendance Notifications
// Stub: does nothing if FIREBASE_SERVICE_ACCOUNT is not set
// ============================================================

async function sendAttendanceNotification({ studentName, scanType, time, timeIST, studentToken, parentToken }) {
  // No-op if Firebase is not configured
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    return; // silently skip — FCM not configured
  }

  try {
    // FCM v1 HTTP API — no firebase-admin package needed
    const parsed = JSON.parse(serviceAccount);
    const projectId = parsed.project_id;

    const message = {
      notification: {
        title: scanType === 'entry' ? `✅ ${studentName} arrived` : `🚪 ${studentName} left`,
        body: `Time: ${timeIST}`,
      },
    };

    const tokens = [studentToken, parentToken].filter(Boolean);
    for (const token of tokens) {
      await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { ...message, token } }),
      }).catch(() => {}); // ignore individual failures
    }
  } catch (e) {
    console.warn('[fcm] Notification skipped:', e.message);
  }
}

module.exports = { sendAttendanceNotification };
