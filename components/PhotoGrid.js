"use client";

export default function PhotoGrid({ photos, onPhotoClick, theme }) {
  if (!photos || photos.length === 0) {
    return (
      <p style={{ color: theme.subtext }}>
        No photos yet — be the first to upload 📸
      </p>
    );
  }

  return (
<div style={styles.imageWrapper} key={photo.id}>
  <img
    src={`${photo.url}?width=600`}
    style={styles.image}
    onClick={() => onPhotoClick(index)}
  />

  {/* ACTIONS */}
  <div style={styles.overlay}>
    <span>❤️ {photo.likes || 0}</span>
    <span>💬</span>
  </div>
</div>

const styles = {
  grid: {
    columnCount: 2,
    columnGap: "10px",
  },
  image: {
    width: "100%",
    marginBottom: "10px",
    borderRadius: "12px",
    cursor: "pointer",
  },
  imageWrapper: {
  position: "relative",
},

overlay: {
  position: "absolute",
  bottom: "8px",
  left: "8px",
  display: "flex",
  gap: "10px",
  color: "#fff",
  fontSize: "14px",
  background: "rgba(0,0,0,0.4)",
  padding: "4px 8px",
  borderRadius: "10px",
},
};
