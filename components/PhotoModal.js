"use client";

import { useEffect } from "react";

export default function PhotoModal({ photos, index, onClose }) {
  if (index === null || !photos[index]) return null;

  const photo = photos[index];

  const next = () => {
    if (index < photos.length - 1) {
      onClose(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      onClose(index - 1);
    }
  };

  return (
    <div style={styles.overlay}>
      
      {/* EXIT */}
      <button style={styles.close} onClick={() => onClose(null)}>
        ✕
      </button>

      {/* IMAGE */}
      <img
        src={`${photo.url}?width=1200`}
        style={styles.image}
      />

      {/* NAV */}
      <button style={styles.left} onClick={prev}>‹</button>
      <button style={styles.right} onClick={next}>›</button>

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
    maxHeight: "90%",
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
  left: {
    position: "absolute",
    left: "10px",
    fontSize: "40px",
    color: "#fff",
    background: "none",
    border: "none",
  },
  right: {
    position: "absolute",
    right: "10px",
    fontSize: "40px",
    color: "#fff",
    background: "none",
    border: "none",
  },
};
