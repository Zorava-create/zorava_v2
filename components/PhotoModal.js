"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PhotoModal({ photos, index, onClose }) {
  if (index === null || !photos[index]) return null;

  const photo = photos[index];

  const [likes, setLikes] = useState(photo.likes || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("zorava_name") || ""
      : ""
  );
  const [showComments, setShowComments] = useState(false);
  const [hearts, setHearts] = useState([]);

  // 🔁 LOAD LIKE STATE
  useEffect(() => {
    const likedKey = `liked_${photo.id}`;
    setLiked(!!localStorage.getItem(likedKey));
  }, [photo.id]);

  // ❤️ LIKE TOGGLE
  const handleLike = async () => {
    const likedKey = `liked_${photo.id}`;

    if (liked) {
      // REMOVE LIKE
      localStorage.removeItem(likedKey);

      const newLikes = Math.max(likes - 1, 0);
      setLikes(newLikes);
      setLiked(false);

      await supabase
        .from("photos")
        .update({ likes: newLikes })
        .eq("id", photo.id);

      return;
    }

    // ADD LIKE
    localStorage.setItem(likedKey, "true");

    const newLikes = likes + 1;
    setLikes(newLikes);
    setLiked(true);

    // ✨ MULTIPLE FLOATING HEARTS
    for (let i = 0; i < 4; i++) {
      const heart = {
        id: Date.now() + i,
        left: Math.random() * 60 + 20,
      };

      setHearts((prev) => [...prev, heart]);

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== heart.id));
      }, 1000);
    }

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

    const savedName = name || "Guest";

    await supabase.from("comments").insert([
      {
        photo_id: photo.id,
        text: newComment,
        name: savedName,
      },
    ]);

    localStorage.setItem("zorava_name", savedName);

    setNewComment("");
    fetchComments();
  };

  // ❌ DELETE COMMENT
  const deleteComment = async (id, commentName) => {
    if (commentName !== name) return;

    await supabase.from("comments").delete().eq("id", id);
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
        <span
          key={h.id}
          style={{
            ...styles.floatingHeart,
            left: `${h.left}%`,
          }}
        >
          ❤️
        </span>
      ))}

      {/* ACTION BAR */}
      <div style={styles.actions}>
        <span
          onClick={handleLike}
          style={{
            ...styles.icon,
            color: liked ? "#ff4d6d" : "#fff",
          }}
        >
          ❤️ {likes}
        </span>

        <span onClick={() => setShowComments(!showComments)} style={styles.icon}>
          💬 {comments.length}
        </span>
      </div>

      {/* COMMENT POPUP */}
      {showComments && (
        <div style={styles.commentPopup}>
          
          <div style={styles.commentList}>
            {comments.map((c) => (
              <div key={c.id} style={styles.commentRow}>
                <p>
                  <strong>{c.name}:</strong> {c.text}
                </p>

                {c.name === name && (
                  <button
                    onClick={() => deleteComment(c.id, c.name)}
                    style={styles.delete}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <button onClick={addComment}>Send</button>
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
    gap: "20px",
    color: "#fff",
    fontSize: "18px",
  },

  icon: {
    cursor: "pointer",
  },

  floatingHeart: {
    position: "absolute",
    bottom: "40%",
    fontSize: "26px",
    animation: "floatUp 1s ease-out forwards",
  },

  commentPopup: {
    position: "absolute",
    bottom: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#222",
    padding: "12px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  commentList: {
    maxHeight: "150px",
    overflowY: "auto",
  },

  commentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  delete: {
    background: "none",
    border: "none",
    color: "red",
    cursor: "pointer",
  },
};
