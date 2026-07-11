import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import { useAuth } from "./auth/AuthProvider.jsx";

export default function usePhotoSocial(selectedPhoto, setSelectedPhoto) {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [photoComments, setPhotoComments] = useState([]);  
  const [userLikedPhoto, setUserLikedPhoto] = useState(false);
  const [dialog, setDialog] = useState(null);

  function showDialog(config) {
  setDialog(config);
}

function closeDialog() {
  setDialog(null);
}

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
      if (!current || String(current.id) !== String(photoId)) return current;
      return {
        ...current,
        likes_count: data.likes_count ?? 0,
        views_count: data.views_count ?? 0,
        comments_count: data.comments_count ?? 0,
      };
    });
  }

  useEffect(() => {
    async function checkUserLike() {
      if (!user || !selectedPhoto?.id) {
        setUserLikedPhoto(false);
        return;
      }

      const { data, error } = await supabase
        .from("photo_likes")
        .select("id")
        .eq("submission_id", selectedPhoto.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Check like error:", error);
        setUserLikedPhoto(false);
        return;
      }

      setUserLikedPhoto(!!data);
    }

    checkUserLike();
  }, [user, selectedPhoto?.id]);

useEffect(() => {
  async function registerView() {
    
    if (!selectedPhoto?.id) return;

    const visitorStorageKey = "humanMosaicVisitorKey";
    let visitorId = localStorage.getItem(visitorStorageKey);

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(visitorStorageKey, visitorId);
    }

    let sessionId = sessionStorage.getItem("humanMosaicSessionId");

if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem("humanMosaicSessionId", sessionId);
}
    
    const visitorKey = `${visitorId}_${sessionId}_${selectedPhoto.id}`;

const localViewKey = `humanMosaicViewed_${selectedPhoto.id}`;

    if (sessionStorage.getItem(localViewKey)) {
      await refreshSelectedPhoto(selectedPhoto.id);
      return;
    }

    const { error } = await supabase.from("photo_views").insert({
      submission_id: selectedPhoto.id,
      visitor_key: visitorKey,
    });
    
    if (error) {
      const isDuplicate =
        error.code === "23505" ||
        error.status === 409 ||
        error.message?.toLowerCase().includes("duplicate");

      if (!isDuplicate) {
        console.error("View insert error:", error);
        return;
      }
    }

    sessionStorage.setItem(localViewKey, "true");

setSelectedPhoto((current) => {
  if (!current) return current;

  return {
    ...current,
    views_count: Number(current.views_count || 0) + 1,
  };
});

setTimeout(() => {
  refreshSelectedPhoto(selectedPhoto.id);
}, 1000);
  }

  registerView();
}, [selectedPhoto?.id]);

useEffect(() => {
  async function loadComments() {
    if (!selectedPhoto?.id) {
      setPhotoComments([]);
      return;
    }

    const { data: comments, error: commentsError } = await supabase
      .from("photo_comments")
      .select("id, comment, created_at, user_id")
      .eq("submission_id", selectedPhoto.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (commentsError) {
      console.error("Load comments error:", commentsError);
      setPhotoComments([]);
      return;
    }

    if (!comments?.length) {
      setPhotoComments([]);
      return;
    }

    const userIds = [
      ...new Set(
        comments
          .map((comment) => comment.user_id)
          .filter(Boolean)
      ),
    ];

    const { data: profiles, error: profilesError } = await supabase.rpc(
  "get_comment_profiles",
  {
    p_user_ids: userIds,
  }
);

    if (profilesError) {
      console.error("Load comment profiles error:", profilesError);

      setPhotoComments(
        comments.map((comment) => ({
          ...comment,
          profile: null,
        }))
      );

      return;
    }

    const profilesById = Object.fromEntries(
      (profiles || []).map((profile) => [profile.id, profile])
    );

    const enrichedComments = comments.map((comment) => ({
      ...comment,
      profile: profilesById[comment.user_id] || null,
    }));

    setPhotoComments(enrichedComments);
  }

  loadComments();
}, [selectedPhoto?.id]);

  async function handleLike() {    
    if (!selectedPhoto?.id) return;

    if (!user) {
  showDialog({
    icon: "❤️",
    title: "Join the Community",
    message:
      "Sign in to like this memory and become part of The Human Mosaic.",
    confirmText: "Login",
    cancelText: "Close",
    action: "login",
  });
  return;
}

    const { data: existingLike, error: checkError } = await supabase
      .from("photo_likes")
      .select("id")
      .eq("submission_id", selectedPhoto.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error("Check like error:", checkError);
      return;
    }

    if (existingLike) {
  showDialog({
    icon: "❤️",
    title: "Already Part of This Memory",
    message: "You have already liked this memory.",
    confirmText: "Close",
  });
  return;
}

    const { error: insertError } = await supabase.from("photo_likes").insert({
      submission_id: selectedPhoto.id,
      user_id: user.id,
    });

    if (insertError) {
      console.error("Insert like error:", insertError);
      return;
    }

    setUserLikedPhoto(true);

setSelectedPhoto((current) => {
  if (!current) return current;

  return {
    ...current,
    likes_count: Number(current.likes_count || 0) + 1,
  };
});

setTimeout(() => {
  refreshSelectedPhoto(selectedPhoto.id);
}, 1000);
  }

  async function handleSendComment() {  
        if (!user) {
  showDialog({
    icon: "💬",
    title: "Join the Conversation",
    message:
      "Sign in to comment on this memory and connect with the community.",
    confirmText: "Login",
    cancelText: "Close",
    action: "login",
  });
  return;
}

    if (!selectedPhoto?.id) return;

    if (!newComment.trim()) {
  showDialog({
    icon: "✦",
    title: "Write Your Message",
    message: "Please write a comment before publishing it.",
    confirmText: "Close",
  });
  return;
}

    const { data, error } = await supabase
  .from("photo_comments")
  .insert({
    submission_id: selectedPhoto.id,
    user_id: user.id,
    comment: newComment.trim(),
  })
  .select("id, comment, created_at, user_id");

const insertedComment = data?.[0];
    
    if (error) {
  console.error("Send comment error:", error);

  showDialog({
    icon: "⚠️",
    title: "Comment Not Published",
    message:
      "We could not publish your comment. Please try again in a moment.",
    confirmText: "Close",
  });

  return;
}

    setNewComment("");

setPhotoComments((current) => [
  {
    ...insertedComment,
    profile: {
      nickname:
        profile?.nickname ||
        user?.user_metadata?.nickname ||
        "Museum visitor",
      country:
        profile?.country ||
        user?.user_metadata?.country ||
        "Country unavailable",
    },
  },
  ...current,
]);
    
setSelectedPhoto((current) => {
  if (!current) return current;

  return {
    ...current,
    comments_count: Number(current.comments_count || 0) + 1,
  };
});

setTimeout(() => {
  refreshSelectedPhoto(selectedPhoto.id);
}, 1000);
  }

  return {
    newComment,
    setNewComment,
    photoComments,
    setPhotoComments,
    currentUser: user,
    userLikedPhoto,
    setUserLikedPhoto,
    dialog,
closeDialog,
    handleLike,
    handleSendComment,
  };
}
