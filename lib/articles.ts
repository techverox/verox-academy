import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  setDoc, 
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import { Article } from "@/types/firestore";

/**
 * Fetches all published articles.
 */
export const getArticles = async (limitCount = 10): Promise<Article[]> => {
  const articlesRef = collection(db, "articles");
  const q = query(
    articlesRef, 
    where("published", "==", true),
    orderBy("publishedAt", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Article));
};

/**
 * Fetches an article by its slug.
 */
export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  const articlesRef = collection(db, "articles");
  const q = query(articlesRef, where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const articleDoc = querySnapshot.docs[0];
  const articleData = { id: articleDoc.id, ...articleDoc.data() } as Article;

  // Increment view count (fire and forget)
  setDoc(doc(db, "articles", articleDoc.id), { viewCount: increment(1) }, { merge: true });

  return articleData;
};

/**
 * Fetches articles by category.
 */
export const getArticlesByCategory = async (category: string): Promise<Article[]> => {
  const articlesRef = collection(db, "articles");
  const q = query(
    articlesRef, 
    where("published", "==", true),
    where("category", "==", category),
    orderBy("publishedAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
};

/**
 * Fetches articles by creator/author.
 */
export const getArticlesByAuthor = async (authorId: string): Promise<Article[]> => {
  const articlesRef = collection(db, "articles");
  const q = query(
    articlesRef, 
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
};

/**
 * Creates or updates an article.
 */
export const saveArticle = async (articleData: Partial<Article>) => {
  const articlesRef = collection(db, "articles");
  const articleId = articleData.id || doc(articlesRef).id;
  const articleRef = doc(db, "articles", articleId);

  const data = {
    ...articleData,
    updatedAt: serverTimestamp(),
  };

  if (!articleData.id) {
    // New article defaults
    (data as any).createdAt = serverTimestamp();
    (data as any).viewCount = 0;
    if (data.published && !data.publishedAt) {
      (data as any).publishedAt = serverTimestamp();
    }
  } else if (articleData.published && !articleData.publishedAt) {
    // Just published
    (data as any).publishedAt = serverTimestamp();
  }

  await setDoc(articleRef, data, { merge: true });
  return articleId;
};
