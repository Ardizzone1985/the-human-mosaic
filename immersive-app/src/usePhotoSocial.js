import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function usePhotoSocial(selectedPhoto, setSelectedPhoto) {
  const [newComment, setNewComment] = useState("");
  const [photoComments, setPhotoComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLikedPhoto, setUserLikedPhoto] = useState(false);

  async function refreshSelectedPhoto(photoId) {
    if (!photoId) return;

    const { data, error } = await supabase
      .from("submissions")
      .select("id, likes_count, views_count, comments_count")
      .eq("id", photoId)
      .single();

    if (error) {
      console.error("Refresh photo error:", error);
      return;
    }

    setSelectedPhoto((current) => {
      if (!current || current.id !== photoId) return current;
      return {
        ...current,
        likes_count: data.likes_count ?? 0,
        views_count: data.views_count ?? 0,
        comments_count: data.comments_count ?? 0,
      };
    });
  }

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUser(user);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function checkUserLike() {
      if (!currentUser || !selectedPhoto?.id) {
        setUserLikedPhoto(false);
        return;
      }

      const { data, error } = await supabase
        .from("photo_likes")
        .select("id")
        .eq("submission_id", selectedPhoto.id)
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Check like error:", error);
        setUserLikedPhoto(false);
        return;
      }

      setUserLikedPhoto(!!data);
    }

    checkUserLike();
  }, [currentUser, selectedPhoto?.id]);

useEffect(() => {
  async function registerView() {
    if (!selectedPhoto?.id) return;

    const visitorStorageKey = "humanMosaicVisitorKey";
    let visitorKey = localStorage.getItem(visitorStorageKey);

    if (!visitorKey) {
      visitorKey = crypto.randomUUID();
      localStorage.setItem(visitorStorageKey, visitorKey);
    }

    const { error } = await supabase.from("photo_views").insert({
      submission_id: selectedPhoto.id,
      visitor_key: visitorKey,
    });

    if (error && error.code !== "23505") {
      console.error("View insert error:", error);
      return;
    }

    await refreshSelectedPhoto(selectedPhoto.id);
  }

  registerView();
}, [selectedPhoto?.id]);

  useEffect(() => {
    async function loadComments() {
      if (!selectedPhoto?.id) {
        setPhotoComments([]);
        return;
      }

      const { data, error } = await supabase
        .from("photo_comments")
        .select("id, comment, created_at, user_id")
        .eq("submission_id", selectedPhoto.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Load comments error:", error);
        return;
      }

      setPhotoComments(data || []);
    }

    loadComments();
  }, [selectedPhoto?.id]);

  async function handleLike() {
    if (!selectedPhoto?.id) return;

    if (!currentUser) {
      alert("Please sign in to like this memory.");
      return;
    }

    const { data: existingLike, error: checkError } = await supabase
      .from("photo_likes")
      .select("id")
      .eq("submission_id", selectedPhoto.id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (checkError) {
      console.error("Check like error:", checkError);
      return;
    }

    if (existingLike) {
      alert("You have already liked this memory.");
      return;
    }

    const { error: insertError } = await supabase.from("photo_likes").insert({
      submission_id: selectedPhoto.id,
      user_id: currentUser.id,
    });

    if (insertError) {
      console.error("Insert like error:", insertError);
      return;
    }

    setUserLikedPhoto(true);
    await refreshSelectedPhoto(selectedPhoto.id);
  }

  async function handleSendComment() {
    if (!currentUser) {
      alert("Please sign in to comment.");
      return;
    }

    if (!selectedPhoto?.id) return;

    if (!newComment.trim()) {
      alert("Write a comment first.");
      return;
    }

    const { data: insertedComment, error } = await supabase
      .from("photo_comments")
      .insert({
        submission_id: selectedPhoto.id,
        user_id: currentUser.id,
        comment: newComment.trim(),
      })
      .select("id, comment, created_at, user_id")
      .single();

    if (error) {
      console.error("Send comment error:", error);
      alert("Unable to send comment.");
      return;
    }

    setNewComment("");
    setPhotoComments((current) => [insertedComment, ...current]);

    await refreshSelectedPhoto(selectedPhoto.id);
  }

  return {
    newComment,
    setNewComment,
    photoComments,
    setPhotoComments,
    currentUser,
    userLikedPhoto,
    setUserLikedPhoto,
    handleLike,
    handleSendComment,
  };
}
