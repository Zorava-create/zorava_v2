"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PhotoModal({ photos, index, onClose }) {
  if (index === null || !photos[index]) return null;

  const photo = photos[index];

  const [likes, setLikes] = useState(photo.likes || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [hearts, setHearts] = useState([]);

  // ❤️ LIKE
  const handleLike = async () => {
    const newLikes = likes + 1;
    setLikes(newLikes);

    // floating hearts
    const newHeart = { id: Date.now() };
    setHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1000);

    await supabase
      .from("photos")
      .update({ likes: newLikes })
      .eq("id", photo.id);
  };

  // 💬 FETCH COMMENTS
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("photo_id", photo.id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  useEffect(() => {
    fetchComments();
  }, [photo.id]);

  // 💬 ADD COMMENT
  const addComment = async () => {
    if (!newComment) return;

    await supabase.from("comments").insert([
      {
        photo_id: photo.id,
        text: newComment,
        name: name || "Guest",
      },
    ]);

    setNewComment("");
    fetchComments();
  };

  return (
    <div style={styles.overlay}>
      
      {/* CLOSE */}
      <button style={styles.close} onClick={() => onClose(null)}>
        ✕
      </button>

      {/* IMAGE */}
      <img src={`${photo.url}?width=1200`} style={styles.image} />

      {/* FLOATING HEARTS */}
      {hearts.map((h) => (
        <span key={h.id} style={styles.floatingHeart}>❤️</span>
      ))}

      {/* ACTION BAR */}
      <div style={styles.actions}>
        <span onClick={handleLike} style={styles.icon}>
          ❤️ {likes}
        </span>

        <span onClick={() => setShowComments(true)} style={styles.icon}>
          💬 {comments.length}
        </span>
      </div>

      {/* COMMENTS PANEL */}
      {showComments && (
        <div style={styles.commentPanel}>
          
          <button style={styles.closePanel} onClick={() => setShowComments(false)}>
            ✕
          </button>

          <div style={styles.commentList}>
            {comments.map((c) => (
              <p key={c.id}>
                <strong>{c.name || "Guest"}:</strong> {c.text}
              </p>
            ))}
          </div>

          <div style={styles.inputRow}>
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={addComment}>Send</button>
          </div>

        </div>
      )}

    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  image: {
    maxWidth: "95%",
    maxHeight: "85%",
    borderRadius: "12px",
  },

  close: {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "24px",
    color: "#fff",
    background: "none",
    border: "none",
  },

  actions: {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    display: "flex",
    gap: "15px",
    color: "#fff",
    fontSize: "18px",
  },

  icon: {
    cursor: "pointer",
  },

  floatingHeart: {
    position: "absolute",
    bottom: "50%",
    fontSize: "30px",
    animation: "floatUp 1s ease-out forwards",
  },

  commentPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    background: "#111",
    padding: "15px",
    color: "#fff",
  },

  closePanel: {
    position: "absolute",
    right: "10px",
    top: "10px",
  },

  commentList: {
    maxHeight: "200px",
    overflowY: "auto",
    marginBottom: "10px",
  },

  inputRow: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
};
