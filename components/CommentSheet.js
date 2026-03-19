"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CommentSheet({ photo, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");

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
    if (photo) fetchComments();
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

  if (!photo) return null;

  return (
    <div style={styles.overlay}>
      
      {/* BACKDROP */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* SHEET */}
      <div style={styles.sheet}>
        
        {/* HANDLE */}
        <div style={styles.handle} />

        {/* HEADER */}
        <div style={styles.header}>
          <span style={styles.title}>Comments</span>
        </div>

        {/* COMMENT LIST */}
        <div style={styles.list}>
          {comments.map((c) => (
            <div key={c.id} style={styles.comment}>
              <span style={styles.name}>{c.name}</span>
              <span style={styles.text}>{c.text}</span>
            </div>
          ))}
        </div>

        {/* INPUT AREA */}
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
    background: "rgba(0,0,0,0.4)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: "75%",
    background: "#fff",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    display: "flex",
    flexDirection: "column",
    animation: "slideUp 0.25s ease",
  },

  handle: {
    width: "40px",
    height: "4px",
    background: "#ddd",
    borderRadius: "999px",
    alignSelf: "center",
    marginTop: "8px",
    marginBottom: "8px",
  },

  header: {
    padding: "8px 16px",
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
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
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
    padding: "10px",
    borderTop: "1px solid #eee",
  },

  row: {
    display: "flex",
    gap: "8px",
    marginTop: "6px",
  },

  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },

  send: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "none",
    background: "#c6a46c",
    color: "#fff",
    cursor: "pointer",
  },
};
