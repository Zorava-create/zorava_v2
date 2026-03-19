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
    <div style={styles.grid}>
      {photos.map((photo, index) => (
        <img
          key={photo.id}
          src={photo.url}
          alt=""
          loading="lazy"
          style={styles.image}
          onClick={() => onPhotoClick(index)}
        />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  image: {
    width: "100%",
    borderRadius: "12px",
    cursor: "pointer",
    objectFit: "cover",
  },
};
