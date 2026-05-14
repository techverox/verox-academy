"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Comment, CommentReply } from "@/types/firestore";
import { 
  subscribeToComments, 
  subscribeToCommentLikes,
  addComment as dbAddComment,
  updateComment as dbUpdateComment,
  deleteComment as dbDeleteComment,
  addReply as dbAddReply,
  toggleCommentLike as dbToggleLike
} from "@/lib/firestore";
import { useAuth } from "./use-auth";

export function useComments(lessonId: string | undefined) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  
  const lastDocRef = useRef<any>(null);
  const pageSize = 10;

  // Initial Fetch & Likes Subscription
  useEffect(() => {
    if (!lessonId) return;

    setLoading(true);
    setComments([]);
    lastDocRef.current = null;

    const unsubscribeComments = subscribeToComments(lessonId, pageSize, null, (newComments, lastVisible) => {
      setComments(newComments);
      lastDocRef.current = lastVisible;
      setHasMore(newComments.length === pageSize);
      setLoading(false);
    });

    const unsubscribeLikes = subscribeToCommentLikes(user?.uid, (ids) => {
      setLikedCommentIds(ids);
    });

    return () => {
      unsubscribeComments();
      unsubscribeLikes();
    };
  }, [lessonId, user?.uid]);

  const loadMore = useCallback(() => {
    if (!lessonId || !hasMore || loading) return;

    subscribeToComments(lessonId, pageSize, lastDocRef.current, (moreComments, lastVisible) => {
      setComments(prev => [...prev, ...moreComments]);
      lastDocRef.current = lastVisible;
      setHasMore(moreComments.length === pageSize);
    });
  }, [lessonId, hasMore, loading]);

  const addComment = async (content: string) => {
    if (!user || !lessonId) return;
    await dbAddComment({
      lessonId,
      userId: user.uid,
      userName: user.name || "Student",
      userPhoto: user.photoURL || null,
      content,
    });
  };

  const updateComment = async (id: string, content: string) => {
    await dbUpdateComment(id, content);
  };

  const deleteComment = async (id: string) => {
    await dbDeleteComment(id);
  };

  const toggleLike = async (id: string, type: "comment" | "reply") => {
    if (!user) return;
    await dbToggleLike(user.uid, id, type);
  };

  const addReply = async (commentId: string, content: string) => {
    if (!user || !lessonId) return;
    await dbAddReply({
      commentId,
      lessonId,
      userId: user.uid,
      userName: user.name || "Student",
      userPhoto: user.photoURL || null,
      content,
    });
  };

  return {
    comments,
    likedCommentIds,
    loading,
    hasMore,
    loadMore,
    addComment,
    updateComment,
    deleteComment,
    toggleLike,
    addReply
  };
}
