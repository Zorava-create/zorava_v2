"use client";

import { useEffect, useState } from "react";

export default function PhotoGrid({
  photos,
  onPhotoClick,
  onCommentClick,
}) {
  const [likedMap, setLikedMap] = useState({});

  useEffect(() => {
    const map = {};
    photos.forEach((photo) => {
      if (localStorage.getItem(`liked_${photo.id}`)) {
        map[photo.id] = true;
      }
    });
    setLikedMap(map);
  }, [photos]);

  const handleLike = (photo) => {
    const key = `liked_${photo.id}`;
    const isLiked = likedMap[photo.id];

    if (isLiked) {
      localStorage.removeItem(key);
      photo.likes = Math.max((photo.likes || 0) - 1, 0);
    } else {
      localStorage.setItem(key, "true");
      photo.likes = (photo.likes || 0) + 1;
    }

    setLikedMap((prev) => ({
      ...prev,
      [photo.id]: !isLiked,
    }));
  };

  return (
    <div style={styles.wrapper}>
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
                  src={`${photo.url}?width=500`}
                  style={styles.image}
                />
              </div>

              {/* ACTION BAR */}
              <div style={styles.meta}>
                
                {/* LEFT SIDE */}
                <div style={styles.left}>
                  <button
                    onClick={() => handleLike(photo)}
                    style={styles.action}
                  >
                    <span
                      style={{
                        ...styles.icon,
                        color: isLiked ? "#d94c5c" : "#aaa",
                      }}
                    >
                      ❤️
                    </span>
                    <span style={styles.count}>
                      {photo.likes || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => onCommentClick(index)}
                    style={styles.action}
                  >
                    <span style={styles.icon}>💬</span>
                    <span style={styles.count}>
                      {photo.comment_count || 0}
                    </span>
                  </button>
                </div>

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
    paddingTop: "6px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px", // slightly more refined spacing
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",

    // ✨ KEY DIFFERENCE (premium feel)
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    transition: "transform 0.15s ease",
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#f2f2f2",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  meta: {
    padding: "8px 10px 10px",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  action: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  icon: {
    fontSize: "15px",
  },

  count: {
    fontSize: "12.5px",
    color: "#555",
  },
};
