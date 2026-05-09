import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

async function check() {
  const snap = await getDocs(collection(db, "courses"));
  snap.forEach(doc => {
    console.log(doc.id, doc.data().title, "Published:", doc.data().published);
  });
}
check();
