"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CommentSheet({ photo, onClose, onCommentsChanged, theme }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [likedComments, setLikedComments] = useState({});
  const [translateY, setTranslateY] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  // 🔥 Load localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    setName(localStorage.getItem("zorava_name") || "");

    const storedLikes = JSON.parse(localStorage.getItem("liked_comments") || "{}");
    setLikedComments(storedLikes);
  }, []);

  // 🔥 Fetch comments
  const fetchComments = async () => {
    if (!photo) {
      setComments([]);
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("photo_id", photo.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load comments", error);
      return;
    }

    setComments(data || []);
  };

  useEffect(() => {
    fetchComments();
    setText("");
    setTranslateY(0);
  }, [photo]);

  // 🔥 REALTIME (works now)
  useEffect(() => {
    if (!photo) return;

    const channel = supabase
      .channel(`comments-${photo.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `photo_id=eq.${photo.id}`,
        },
        () => {
          fetchComments();
          onCommentsChanged?.(); // 🔥 updates gallery count
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [photo, onCommentsChanged]);

  const persistLikedComments = (next) => {
    setLikedComments(next);
    localStorage.setItem("liked_comments", JSON.stringify(next));
  };

  // 🔥 SEND COMMENT (FIXED)
  const handleSend = async () => {
    if (!photo || !text.trim()) return;

    const finalName = name.trim() || "Guest";

    setIsSending(true);

    const { error } = await supabase.from("comments").insert([
      {
        photo_id: photo.id,
        text: text.trim(),
        name: finalName,
        likes: 0,
      },
    ]);

    setIsSending(false);

    if (error) {
      console.error(error);
      return;
    }

    localStorage.setItem("zorava_name", finalName);

    setText("");

    await fetchComments();
    onCommentsChanged?.(); // 🔥 ensures grid updates
  };

  // 🔥 LIKE COMMENT (FIXED + STABLE)
  const handleCommentLike = async (comment) => {
    const key = `comment_${comment.id}`;
    const isLiked = !!likedComments[key];

    const newLikes = isLiked
      ? Math.max((comment.likes || 0) - 1, 0)
      : (comment.likes || 0) + 1;

    // instant UI
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id ? { ...c, likes: newLikes } : c
      )
    );

    const updated = {
      ...likedComments,
      [key]: !isLiked,
    };

    if (!updated[key]) delete updated[key];

    persistLikedComments(updated);

    await supabase
      .from("comments")
      .update({ likes: newLikes })
      .eq("id", comment.id);
  };

  // 🔥 DELETE (FIXED)
  const handleDelete = async (comment) => {
    if (comment.name !== name) return;

    await supabase.from("comments").delete().eq("id", comment.id);

    await fetchComments();
    onCommentsChanged?.(); // 🔥 update grid
  };

  // 🔥 SWIPE
  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;

    const diff = e.touches[0].clientY - startYRef.current;
    setTranslateY(diff > 0 ? diff : 0);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;

    if (translateY > 140) {
      onClose();
    } else {
      setTranslateY(0);
    }
  };

  if (!photo) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={onClose} />

      <div
        style={styles.sheet(translateY, theme)}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={styles.handle} />

        <div style={styles.header}>
          Comments ({comments.length})
        </div>

        {/* INPUT */}
        <div style={styles.inputArea}>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

          <div style={styles.row}>
            <textarea
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.textarea}
            />

            <button onClick={handleSend} style={styles.send}>
              {isSending ? "..." : "Send"}
            </button>
          </div>
        </div>

        {/* COMMENTS */}
        <div style={styles.list}>
          {comments.map((c) => {
            const isLiked = likedComments[`comment_${c.id}`];

            return (
              <div key={c.id} style={styles.comment}>
                <div style={styles.topRow}>
                  <span>{c.name}</span>

                  {c.name === name && (
                    <button onClick={() => handleDelete(c)}>✕</button>
                  )}
                </div>

                <p>{c.text}</p>

                <button onClick={() => handleCommentLike(c)}>
                  👍 {c.likes || 0}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
