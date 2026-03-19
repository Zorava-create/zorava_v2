"use client";

import { useEffect } from "react";

export default function PhotoModal({ photo, onClose }) {
  // 🔥 Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!photo) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true">
      
      {/* BACKDROP */}
      <button
        type="button"
        style={styles.backdrop}
        onClick={onClose}
      />

      {/* CONTENT */}
      <div style={styles.content}>
        
        {/* CLOSE BUTTON */}
        <button
          type="button"
          style={styles.closeButton}
          onClick={onClose}
        >
          ✕
        </button>

        {/* IMAGE */}
        <button style={styles.imageWrapper}>
          <img
            src={photo.url}
            alt="Expanded wedding gallery"
            style={styles.image}
          />
        </button>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  backdrop: {
    position: "absolute",
    inset: 0,
    border: "none",
    background: "rgba(17, 15, 13, 0.92)",
    cursor: "pointer",
  },

  content: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  closeButton: {
    position: "absolute",
    top: "-12px",
    right: "0",
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    border: "none",
    background: "rgba(255,255,255,0.16)",
    color: "#fff",
    fontSize: "1.2rem",
    cursor: "pointer",
    backdropFilter: "blur(8px)",
  },

  imageWrapper: {
    border: "none",
    background: "none",
    padding: 0,
  },

  image: {
    width: "100%",
    maxHeight: "85vh",
    objectFit: "contain",
    borderRadius: "24px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
    transition: "transform 0.2s ease",
  },
};
