"use client";

import { useEffect, useState } from "react";

export default function PhotoGrid({ photos, onPhotoClick, theme }) {
  const [likedMap, setLikedMap] = useState({});

  useEffect(() => {
    const map = {};
    photos.forEach((photo) => {
      const key = `liked_${photo.id}`;
      if (localStorage.getItem(key)) {
        map[photo.id] = true;
      }
    });
    setLikedMap(map);
  }, [photos]);

  const handleLike = (photo) => {
    const likedKey = `liked_${photo.id}`;
    const alreadyLiked = likedMap[photo.id];

    if (alreadyLiked) {
      localStorage.removeItem(likedKey);
      photo.likes = Math.max((photo.likes || 0) - 1, 0);

      setLikedMap((prev) => ({
        ...prev,
        [photo.id]: false,
      }));

      return;
    }

    localStorage.setItem(likedKey, "true");
    photo.likes = (photo.likes || 0) + 1;

    setLikedMap((prev) => ({
      ...prev,
      [photo.id]: true,
    }));
  };

  return (
    <div style={{ ...styles.wrapper, background: theme?.background || "#f8f6f2" }}>
      <div style={styles.grid}>
        {photos.map((photo, index) => {
          const isLiked = likedMap[photo.id];

          return (
            <div key={photo.id} style={styles.card}>
              
              {/* IMAGE */}
              <div
                style={styles.imageWrapper}
                onClick={() => onPhotoClick(index)}
              >
                <img
                  src={`${photo.url}?width=600`}
                  style={styles.image}
                />
              </div>

              {/* ACTIONS */}
              <div style={styles.meta}>
                
                {/* LIKE */}
                <button
                  onClick={() => handleLike(photo)}
                  style={styles.actionBtn}
                >
                  <span
                    style={{
                      ...styles.heart,
                      color: isLiked ? "#d94c5c" : "#888",
                    }}
                  >
                    ❤️
                  </span>
                  <span style={styles.count}>
                    {photo.likes || 0}
                  </span>
                </button>

                {/* COMMENTS */}
                <button
                  onClick={() => onPhotoClick(index)}
                  style={styles.actionBtn}
                >
                  <span style={styles.comment}>💬</span>
                  <span style={styles.count}>
                    {photo.comment_count || 0}
                  </span>
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    paddingBottom: "80px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    padding: "0 12px",
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#eee",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  meta: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 12px",
  },

  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  heart: {
    fontSize: "16px",
  },

  comment: {
    fontSize: "16px",
    color: "#888",
  },

  count: {
    fontSize: "13px",
    color: "#555",
  },
};
