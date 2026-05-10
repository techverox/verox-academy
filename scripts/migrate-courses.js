const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json"); // Make sure this exists if running locally

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function migrateCourses() {
  const coursesRef = db.collection("courses");
  const snapshot = await coursesRef.get();

  console.log(`Found ${snapshot.size} courses to migrate.`);

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!data.creatorId) {
      batch.update(doc.ref, {
        creatorId: "admin",
        creatorName: "Verox Admin",
        creatorPhoto: null,
        creatorEmail: "admin@veroxacademy.com",
        instructorId: data.instructorId || "admin"
      });
    }
  });

  await batch.commit();
  console.log("Migration complete.");
}

migrateCourses().catch(console.error);
