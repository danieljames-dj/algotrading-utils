module.exports.firebase = {};

module.exports.connect = async function (production) {
  const admin = require("firebase-admin");
  var serviceAccount = require("../secrets/serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const firestore = admin.firestore();
  Object.assign(module.exports.firebase, {
    brokerCredentialsCollection: firestore.collection("brokerCredentials"),
  });
};
