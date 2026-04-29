var admin = require("firebase-admin");
var serviceAccount = require("./firebase-service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ams-project-8fd8a-default-rtdb.firebaseio.com"
});

module.exports = admin;