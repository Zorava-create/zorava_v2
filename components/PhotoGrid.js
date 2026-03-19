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
        <div key={photo.id} style={styles.card}>
          
          {/* IMAGE */}
          <img
            src={`${photo.url}?width=600`}
            style={styles.image}
            onClick={() => onPhotoClick(index)}
          />

          {/* META BELOW IMAGE */}
          <div style={styles.meta}>
            <span>❤️ {photo.likes || 0}</span>
            <span>💬</span>
          </div>

        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },

  card: {
    display: "flex",
    flexDirection: "column",
  },

  image: {
    width: "100%",
    borderRadius: "10px",
    cursor: "pointer",
  },

  meta: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "12px",
    fontSize: "13px",
    marginTop: "6px",
    color: "#555",
    paddingLeft: "4px",
  },
};
