"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PhotoModal({ photos, index, onClose }) {
  if (index === null || !photos[index]) return null;

  const photo = photos[index];

  // ❤️ Likes
  const [likes, setLikes] = useState(photo.likes || 0);

  // 💬 Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 👉 Like
  const handleLike = async () => {
    const newLikes = likes + 1;
    setLikes(newLikes);

    await supabase
      .from("photos")
      .update({ likes: newLikes })
      .eq("id", photo.id);
  };

  // 👉 Fetch comments
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("photo_id", photo.id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  // 👉 Add comment
  const addComment = async () => {
    if (!newComment) return;

    await supabase.from("comments").insert([
      {
        photo_id: photo.id,
        text: newComment,
      },
    ]);

    setNewComment("");
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [photo.id]);

  return (
    <div style={styles.overlay}>
      
      {/* CLOSE */}
      <button style={styles.close} onClick={() => onClose(null)}>
        ✕
      </button>

      {/* IMAGE */}
      <img src={`${photo.url}?width=1200`} style={styles.image} />

      {/* LIKE */}
      <div style={styles.actions}>
        <span onClick={handleLike} style={styles.like}>
          ❤️ {likes}
        </span>
      </div>

      {/* COMMENTS */}
      <div style={styles.comments}>
        {comments.map((c) => (
          <p key={c.id}>{c.text}</p>
        ))}

        <div style={styles.commentInput}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={addComment}>Send</button>
        </div>
      </div>

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
    maxHeight: "80%",
    borderRadius: "12px",
  },

  close: {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "24px",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },

  actions: {
    position: "absolute",
    bottom: "80px",
    left: "20px",
    color: "#fff",
  },

  like: {
    fontSize: "18px",
    cursor: "pointer",
  },

  comments: {
    position: "absolute",
    bottom: "0",
    width: "100%",
    background: "#111",
    padding: "10px",
    color: "#fff",
  },

  commentInput: {
    display: "flex",
    gap: "5px",
    marginTop: "10px",
  },
};
