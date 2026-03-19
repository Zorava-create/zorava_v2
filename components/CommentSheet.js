"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CommentSheet({ photo, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [likedComments, setLikedComments] = useState({});
  const [translateY, setTranslateY] = useState(0);

  const startY = useRef(0);
  const dragging = useRef(false);

  // ✅ Load local data
  useEffect(() => {
    const storedName = localStorage.getItem("zorava_name");
    if (storedName) setName(storedName);

    const storedLikes = JSON.parse(
      localStorage.getItem("liked_comments") || "{}"
    );
    setLikedComments(storedLikes);
  }, []);

  // ✅ Fetch comments
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("photo_id", photo.id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  // ✅ Realtime updates
  useEffect(() => {
    if (!photo) return;

    fetchComments();

    const channel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [photo]);

  // ✅ Add comment (with instant UI)
  const handleSend = async () => {
    if (!text.trim()) return;

    const finalName = name || "Guest";

    const newComment = {
      id: Date.now(),
      name: finalName,
      text,
      likes: 0,
    };

    setComments((prev) => [newComment, ...prev]); // instant UI

    await supabase.from("comments").insert([
      {
        photo_id: photo.id,
        text,
        name: finalName,
        likes: 0,
      },
    ]);

    localStorage.setItem("zorava_name", finalName);
    setText("");
  };

  // 👍 LIKE TOGGLE (SVG style feel)
  const toggleLikeComment = async (comment) => {
    const key = `comment_${comment.id}`;
    const isLiked = likedComments[key];

    const newLikes = isLiked
      ? Math.max((comment.likes || 0) - 1, 0)
      : (comment.likes || 0) + 1;

    setLikedComments((prev) => ({
      ...prev,
      [key]: !isLiked,
    }));

    await supabase
      .from("comments")
      .update({ likes: newLikes })
      .eq("id", comment.id);
  };

  // ❌ DELETE
  const deleteComment = async (comment) => {
    if (comment.name !== name) return;

    await supabase.from("comments").delete().eq("id", comment.id);
  };

  // 👇 SWIPE DOWN CLOSE
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!dragging.current) return;

    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setTranslateY(diff);
  };

  const handleTouchEnd = () => {
    dragging.current = false;

    if (translateY > 120) onClose();
    else setTranslateY(0);
  };

  if (!photo) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={onClose} />

      <div
        style={{
          ...styles.sheet,
          transform: `translateY(${translateY}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={styles.handle} />

        <div style={styles.header}>
          Comments ({comments.length})
        </div>

        {/* ✅ INPUT FIRST */}
        <div style={styles.inputArea}>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

          <div style={styles.row}>
            <input
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.input}
            />

            <button onClick={handleSend} style={styles.send}>
              Send
            </button>
          </div>
        </div>

        {/* ✅ COMMENTS BELOW */}
        <div style={styles.list}>
          {comments.map((c) => {
            const isLiked = likedComments[`comment_${c.id}`];

            return (
              <div key={c.id} style={styles.comment}>
                <div style={styles.topRow}>
                  <span style={styles.name}>{c.name}</span>

                  {c.name === name && (
                    <button
                      onClick={() => deleteComment(c)}
                      style={styles.delete}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <span style={styles.text}>{c.text}</span>

                <button
                  onClick={() => toggleLikeComment(c)}
                  style={styles.likeBtn}
                >
                  <span
                    style={{
                      color: isLiked ? "#c6a46c" : "#aaa",
                      fontWeight: isLiked ? "600" : "400",
                    }}
                  >
                    👍
                  </span>
                  {c.likes || 0}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
  },

  backdrop: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
  },

  sheet: {
    width: "92%",
    maxWidth: "500px",
    height: "85%",
    background: "#fff",
    borderRadius: "24px",
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  handle: {
    width: "42px",
    height: "5px",
    background: "#ddd",
    borderRadius: "999px",
    alignSelf: "center",
    margin: "10px 0",
  },

  header: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: "6px",
  },

  inputArea: {
    padding: "12px",
    borderBottom: "1px solid #eee",
  },

  row: {
    display: "flex",
    gap: "8px",
    marginTop: "6px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },

  send: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    background: "#c6a46c",
    color: "#fff",
  },

  list: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
  },

  comment: {
    marginBottom: "14px",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
  },

  name: {
    fontSize: "12px",
    fontWeight: "600",
  },

  text: {
    fontSize: "14px",
  },

  delete: {
    background: "none",
    border: "none",
    color: "#999",
    cursor: "pointer",
  },

  likeBtn: {
    marginTop: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
  },
};
