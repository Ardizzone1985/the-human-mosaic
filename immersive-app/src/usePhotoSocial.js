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
