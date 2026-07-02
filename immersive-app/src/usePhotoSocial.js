import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function usePhotoSocial(selectedPhoto, setSelectedPhoto) {
  const [newComment, setNewComment] = useState("");
  const [photoComments, setPhotoComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLikedPhoto, setUserLikedPhoto] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }

    loadUser();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
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

    const { data } = await supabase
      .from("photo_likes")
      .select("id")
      .eq("submission_id", selectedPhoto.id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    setUserLikedPhoto(!!data);
  }

  checkUserLike();
}, [currentUser, selectedPhoto?.id]);

  useEffect(() => {
  async function registerView() {
    if (!selectedPhoto?.id) return;

    const viewKey = `humanMosaicViewed_${selectedPhoto.id}`;
    const lastView = localStorage.getItem(viewKey);
    const now = Date.now();

    // Conta una visualizzazione ogni 30 minuti per dispositivo
    if (lastView && now - Number(lastView) < 30 * 60 * 1000) return;

    const newViewsCount = (selectedPhoto.views_count || 0) + 1;

    const { error } = await supabase
      .from("submissions")
      .update({ views_count: newViewsCount })
      .eq("id", selectedPhoto.id);

    if (error) {
      console.error("View error:", error);
      return;
    }

    localStorage.setItem(viewKey, String(now));

    setSelectedPhoto({
      ...selectedPhoto,
      views_count: newViewsCount,
    });
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

  const { error: insertError } = await supabase
    .from("photo_likes")
    .insert({
      submission_id: selectedPhoto.id,
      user_id: currentUser.id,
    });

  if (insertError) {
    console.error("Insert like error:", insertError);
    return;
  }

  const newLikesCount = (selectedPhoto.likes_count || 0) + 1;

  const { error: updateError } = await supabase
    .from("submissions")
    .update({ likes_count: newLikesCount })
    .eq("id", selectedPhoto.id);

  if (updateError) {
    console.error("Update likes_count error:", updateError);
    return;
  }

  setSelectedPhoto({
    ...selectedPhoto,
    likes_count: newLikesCount,
  });

  setUserLikedPhoto(true);
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
    console.error(error);
    alert("Unable to send comment.");
    return;
  }

  const newCommentsCount = (selectedPhoto.comments_count || 0) + 1;

  await supabase
    .from("submissions")
    .update({
      comments_count: newCommentsCount,
    })
    .eq("id", selectedPhoto.id);

  setSelectedPhoto({
    ...selectedPhoto,
    comments_count: newCommentsCount,
  });

  setNewComment("");
    setPhotoComments((current) => [insertedComment, ...current]);

  alert("Comment published!");
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
