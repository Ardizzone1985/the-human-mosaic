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

  return {
    newComment,
    setNewComment,
    photoComments,
    setPhotoComments,
    currentUser,
    userLikedPhoto,
    setUserLikedPhoto,
  };
}
