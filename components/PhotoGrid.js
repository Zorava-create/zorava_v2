"use client";

export default function PhotoGrid({ photos, onPhotoClick, theme }) {
  const handleLike = (photo) => {
    const likedKey = `liked_${photo.id}`;

    if (localStorage.getItem(likedKey)) return;

    localStorage.setItem(likedKey, "true");

    // optimistic UI (instant feedback)
    photo.likes = (photo.likes || 0) + 1;
  };

  return (
    <div style={styles.grid}>
      {photos.map((photo, index) => (
        <div key={photo.id} style={styles.card}>
          
          <img
            src={`${photo.url}?width=600`}
            style={styles.image}
            onClick={() => onPhotoClick(index)}
          />

          <div style={styles.meta}>
            <span onClick={() => handleLike(photo)} style={styles.icon}>
              ❤️ {photo.likes || 0}
            </span>

            <span onClick={() => onPhotoClick(index)} style={styles.icon}>
              💬
            </span>
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
    gap: "12px",
    fontSize: "13px",
    marginTop: "6px",
    color: "#555",
    paddingLeft: "4px",
  },

  icon: {
    cursor: "pointer",
  },
};
