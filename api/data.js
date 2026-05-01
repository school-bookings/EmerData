// api/data.js
// Vercel Serverless Function — runs on the server, never exposed to the browser.
// Fetches data from both Firebase projects using the Admin SDK (service account auth)
// and returns it as a single JSON response to the analytics page.

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getDatabase }                   = require('firebase-admin/database');

// ── Initialise the GAME app (sessions) ───────────────────────────
function getGameDb() {
  const appName = 'game';
  const existing = getApps().find(a => a.name === appName);
  const app = existing || initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID_GAME,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL_GAME,
      // Vercel stores \n as a literal backslash-n in env vars — this restores real newlines
      privateKey:  process.env.FIREBASE_PRIVATE_KEY_GAME.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID_GAME}-default-rtdb.firebaseio.com`,
  }, appName);
  return getDatabase(app);
}

// ── Initialise the CHARACTERS app (quiz_results + submissions) ───
function getCharsDb() {
  const appName = 'chars';
  const existing = getApps().find(a => a.name === appName);
  const app = existing || initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID_CHARS,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL_CHARS,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY_CHARS.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID_CHARS}-default-rtdb.firebaseio.com`,
  }, appName);
  return getDatabase(app);
}

// ── Handler ───────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gameDb  = getGameDb();
    const charsDb = getCharsDb();

    // Fetch all three collections in parallel
    const [sessionsSnap, quizSnap, subsSnap] = await Promise.all([
      gameDb.ref('sessions').once('value'),
      charsDb.ref('quiz_results').once('value'),
      charsDb.ref('submissions').once('value'),
    ]);

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      sessions:    sessionsSnap.val()  || {},
      quiz_results: quizSnap.val()     || {},
      submissions:  subsSnap.val()     || {},
    });
  } catch (err) {
    console.error('Firebase fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch data from Firebase' });
  }
};
