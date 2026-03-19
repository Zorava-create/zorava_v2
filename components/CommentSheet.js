"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CommentSheet({ photo, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startY = useRef(0);
  const inputRef = useRef(null);

  // Load name
  useEffect(() => {
    const stored = localStorage.getItem("zorava_name");
    if (stored) setName(stored);
  }, []);

  // Fetch comments
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("photo_id", photo.id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  useEffect(() => {
    if (photo) {
      fetchComments();

      // auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [photo]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const finalName = name || "Guest";

    await supabase.from("comments").insert([
      {
        photo_id: photo.id,
        text,
        name: finalName,
      },
    ]);

    localStorage.setItem("zorava_name", finalName);

    setText("");
    fetchComments();
  };

  // 👇 TOUCH HANDLERS (SWIPE DOWN)
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);

    if (translateY > 120) {
      onClose(); // swipe to close
    } else {
      setTranslateY(0); // snap back
    }
  };

  if (!photo) return null;

  return (
    <div style={styles.overlay}>
      
      {/* BACKDROP */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* SHEET */}
      <div
        style={{
          ...styles.sheet,
          transform: `translateY(${translateY}px)`,
          transition: dragging ? "none" : "transform 0.25s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* HANDLE */}
        <div style={styles.handle} />

        {/* HEADER */}
        <div style={styles.header}>
          <span style={styles.title}>Comments</span>
        </div>

        {/* COMMENTS */}
        <div style={styles.list}>
          {comments.map((c) => (
            <div key={c.id} style={styles.comment}>
              <span style={styles.name}>{c.name}</span>
              <span style={styles.text}>{c.text}</span>
            </div>
          ))}
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
            <input
              ref={inputRef}
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

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
  },

  backdrop: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
  },

  sheet: {
    position: "absolute",
    bottom: "10px", // 👈 space from edges
    left: "50%",
    transform: "translateX(-50%)",
    width: "94%", // 👈 not full width
    maxHeight: "75%",

    background: "#fff",
    borderRadius: "24px", // 👈 more premium curve

    display: "flex",
    flexDirection: "column",

    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },

  handle: {
    width: "42px",
    height: "5px",
    background: "#ddd",
    borderRadius: "999px",
    alignSelf: "center",
    marginTop: "10px",
    marginBottom: "8px",
  },

  header: {
    padding: "8px 16px",
    textAlign: "center",
    fontWeight: "600",
  },

  title: {
    fontSize: "14px",
  },

  list: {
    flex: 1,
    overflowY: "auto",
    padding: "0 16px",
  },

  comment: {
    marginBottom: "12px",
  },

  name: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#333",
  },

  text: {
    fontSize: "14px",
    color: "#444",
  },

  inputArea: {
    padding: "12px",
    borderTop: "1px solid #eee",
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
    fontSize: "14px",
  },

  send: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    background: "#c6a46c",
    color: "#fff",
    cursor: "pointer",
  },
};
