
const admin = require('firebase-admin');
const serviceAccount = require('../verox-academy-firebase-adminsdk-fbsvc-c47af3cd3f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkDoc() {
  const courseId = 'epHaemGrCwpaWXnAW101';
  const doc = await db.collection('courses').doc(courseId).get();
  if (!doc.exists) {
    console.log('Course not found');
  } else {
    console.log('Course Data:', JSON.stringify(doc.data(), null, 2));
  }
  
  const lessons = await db.collection('lessons').where('courseId', '==', courseId).get();
  console.log('Lessons count:', lessons.size);
  lessons.forEach(l => {
    console.log('Lesson:', l.id, JSON.stringify(l.data(), null, 2));
  });
  
  process.exit(0);
}

checkDoc().catch(err => {
  console.error(err);
  process.exit(1);
});
