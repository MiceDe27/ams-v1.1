var admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://ams-project-8fd8a-default-rtdb.firebaseio.com"
    });
  } catch (error) {
    console.error("Firebase Init Error:", error.message);
  }
}

module.exports = admin;
