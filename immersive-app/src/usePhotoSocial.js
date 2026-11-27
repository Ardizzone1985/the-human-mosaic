import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient.js";
import { useAuth } from "./auth/AuthProvider.jsx";

export default function usePhotoSocial(selectedPhoto, setSelectedPhoto) {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [photoComments, setPhotoComments] = useState([]);  
  const [userLikedPhoto, setUserLikedPhoto] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [isLikeUpdating, setIsLikeUpdating] = useState(false);
const likeRequestInProgress = useRef(false);
const activeLikeContext = useRef(null);

activeLikeContext.current = {
  photoId: selectedPhoto?.id,
  userId: user?.id,
};

  function showDialog(config) {
  setDialog(config);
}

function closeDialog() {
  setDialog(null);
}

  async function refreshSelectedPhoto(photoId) {
    if (!photoId) return;

        const { data, error } = await supabase
      .rpc("get_public_photo_stats", {
        p_photo_id: photoId,
      })
      .maybeSingle();

        if (error) {
      console.error("Refresh photo error:", error);
      return;
    }

    if (!data) return;

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
  .eq("approval_status", "approved")
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

  if (likeRequestInProgress.current) return;

  likeRequestInProgress.current = true;
setIsLikeUpdating(true);

  const photoId = selectedPhoto.id;
  const userId = user.id;

  const isCurrentContext = () =>
    String(activeLikeContext.current?.photoId) === String(photoId) &&
    activeLikeContext.current?.userId === userId;

  try {
    const { data: existingLike, error: checkError } = await supabase
      .from("photo_likes")
      .select("id")
      .eq("submission_id", photoId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!isCurrentContext()) return;

    let nextLikedState;

    if (existingLike) {
      // UNLIKE: remove only the current user's like.

      const { data: deletedLike, error: deleteError } = await supabase
        .from("photo_likes")
        .delete()
        .eq("id", existingLike.id)
        .eq("submission_id", photoId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (deleteError) throw deleteError;

      if (!deletedLike) {
        throw new Error("Like removal could not be confirmed");
      }

      nextLikedState = false;

    } else {
      // LIKE: insert only for the current user.

      const { error: insertError } = await supabase
        .from("photo_likes")
        .insert({
          submission_id: photoId,
          user_id: userId,
        });

      if (insertError) throw insertError;

      nextLikedState = true;
    }

    if (isCurrentContext()) {
      setUserLikedPhoto(nextLikedState);
      await refreshSelectedPhoto(photoId);
    }

  } catch (error) {
    console.error("Like/Unlike error:", error);

    if (isCurrentContext()) {
      showDialog({
        icon: "⚠️",
        title: "Unable to Update Like",
        message:
          "We could not update your like. Please try again in a moment.",
        confirmText: "Close",
      });
    }

  } finally {
  likeRequestInProgress.current = false;
  setIsLikeUpdating(false);
}
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

  const commentText = newComment.trim();

  if (!commentText) {
    showDialog({
      icon: "✦",
      title: "Write Your Message",
      message: "Please write a comment before publishing it.",
      confirmText: "Close",
    });
    return;
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      showDialog({
        icon: "⚠️",
        title: "Session Required",
        message:
          "Your session has expired. Please sign in again before publishing a comment.",
        confirmText: "Close",
      });
      return;
    }

    const response = await fetch("/api/comments/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        submissionId: selectedPhoto.id,
        comment: commentText,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Send comment error:", result);

      showDialog({
        icon: "⚠️",
        title: "Comment Not Published",
        message:
          result?.error ||
          "We could not publish your comment. Please try again in a moment.",
        confirmText: "Close",
      });
      return;
    }

    setNewComment("");

    if (result.approvalStatus === "pending") {
      showDialog({
        icon: "🛡️",
        title: "Comment Under Review",
        message:
          "Your comment has been submitted for review and is not publicly visible yet.",
        confirmText: "Close",
      });
      return;
    }

    const insertedComment = result.comment;

    if (!insertedComment) {
      console.error("Comment API returned no comment:", result);
      return;
    }

    setPhotoComments((current) => [
      {
        ...insertedComment,
        comment: commentText,
        user_id: user.id,
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
  } catch (error) {
    console.error("Send comment request error:", error);

    showDialog({
      icon: "⚠️",
      title: "Comment Not Published",
      message:
        "We could not publish your comment. Please try again in a moment.",
      confirmText: "Close",
    });
  }
}

  return {
    newComment,
    setNewComment,
    photoComments,
    setPhotoComments,
    currentUser: user,
    userLikedPhoto,
setUserLikedPhoto,
isLikeUpdating,
    dialog,
closeDialog,
    handleLike,
    handleSendComment,
  };
}
