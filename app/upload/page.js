"use client";

import { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { themes } from "../themes";

// 👉 Change this to test different themes:
const theme = themes.pride;

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  // 👉 Open phone picker
  const openPicker = () => {
    fileInputRef.current.click();
  };

  // 👉 Handle upload
  const handleFiles = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);

    for (let file of files) {
      const filePath = `event-1/${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("photos")
        .upload(filePath, file);

      if (error) {
        console.error(error);
        alert("Upload failed");
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

      await supabase.from("photos").insert({
        event_id: "event-1",
        url: data.publicUrl,
        likes: 0,
      });
    }

    setUploading(false);
    setDone(true);
  };

  return (
    <main style={styles.container}>
      
      <div style={styles.card}>
        
        {!done ? (
          <>
            <h1 style={styles.title}>
              Emma & Jake’s Wedding
            </h1>

            <p style={styles.subtitle}>
              Share your photos from our special day.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              capture="environment"
              onChange={handleFiles}
              style={{ display: "none" }}
            />

            <button onClick={openPicker} style={styles.uploadButton}>
              {uploading ? "Uploading..." : "📷 Upload Photos"}
            </button>

            <p style={styles.link}>
              ❤️ View Gallery
            </p>

            <p style={styles.footer}>
              No app needed · Takes seconds
            </p>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Thank You 💛</h1>

            <p style={styles.subtitle}>
              Thank you for sharing your memories with the happy couple.
            </p>

            <p style={styles.footer}>
              Powered by Zorava
            </p>
          </>
        )}

      </div>

    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: theme.background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    background: theme.card,
    padding: "40px 30px",
    border: "1px solid rgba(212,175,55,0.15)",
    borderRadius: "18px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
    textAlign: "center",
    width: "100%",
    maxWidth: "420px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "500",
    color: theme.text,
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "14px",
    color: theme.subtext,
    marginBottom: "25px",
  },

  uploadButton: {
    background: theme.primary,
    color: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: "10px",
    width: "100%",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
    marginBottom: "15px",
  },

  link: {
    fontSize: "14px",
    color: theme.text,
    cursor: "pointer",
    marginBottom: "20px",
  },

  footer: {
    fontSize: "12px",
    color: theme.subtext,
  },
};
