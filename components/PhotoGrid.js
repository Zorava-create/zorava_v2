"use client";

import { useEffect, useState } from "react";

export default function PhotoGrid({
  photos,
  onPhotoClick,
  onCommentClick,
  onToggleLike,
  theme,
}) {
  const [likedMap, setLikedMap] = useState({});
  const [loadingLikes, setLoadingLikes] = useState({}); // 🔥 prevent spam taps

  useEffect(() => {
    const nextLikedMap = photos.reduce((acc, photo) => {
      if (
        typeof window !== "undefined" &&
        localStorage.getItem(`liked_${photo.id}`)
      ) {
        acc[photo.id] = true;
      }
      return acc;
    }, {});

    setLikedMap(nextLikedMap);
  }, [photos]);

  const handleLikeClick = async (photoId) => {
    if (loadingLikes[photoId]) return; // 🔥 prevent double tap

    const storageKey = `liked_${photoId}`;
    const isLiked = !!likedMap[photoId];
    const shouldLike = !isLiked;

    // optimistic UI
    setLikedMap((prev) => ({
      ...prev,
      [photoId]: shouldLike,
    }));

    setLoadingLikes((prev) => ({
      ...prev,
      [photoId]: true,
    }));

    if (shouldLike) {
      localStorage.setItem(storageKey, "true");
    } else {
      localStorage.removeItem(storageKey);
    }

    try {
      await onToggleLike(photoId, shouldLike);
    } catch (err) {
      // rollback on failure
      setLikedMap((prev) => ({
        ...prev,
        [photoId]: isLiked,
      }));

      if (isLiked) {
        localStorage.setItem(storageKey, "true");
      } else {
        localStorage.removeItem(storageKey);
      }
    }

    setLoadingLikes((prev) => ({
      ...prev,
      [photoId]: false,
    }));
  };

  return (
    <div style={styles.grid}>
      {photos.map((photo, index) => {
        const isLiked = !!likedMap[photo.id];

        return (
          <article key={photo.id} style={styles.card(theme)}>
            
            {/* IMAGE */}
            <button
              type="button"
              style={styles.imageButton}
              onClick={() => onPhotoClick(index)}
            >
              <img
                src={photo.url}
                alt="Wedding gallery"
                style={styles.image}
              />
            </button>

            {/* ACTIONS */}
            <div style={styles.actionsRow}>
              
              {/* LIKE */}
              <button
                type="button"
                onClick={() => handleLikeClick(photo.id)}
                style={styles.actionButton}
              >
                <span style={styles.actionIcon(isLiked)}>
                  ❤️
                </span>
                <span style={styles.actionCount}>
                  {photo.likes || 0}
                </span>
              </button>

              {/* COMMENT */}
              <button
                type="button"
                onClick={() => onCommentClick(index)}
                style={styles.actionButton}
              >
                <span style={styles.commentIcon(theme)}>
                  💬
                </span>
                <span style={styles.actionCount}>
                  {photo.comment_count || 0}
                </span>
              </button>

            </div>
          </article>
        );
      })}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },

  card: (theme) => ({
    background: theme?.card || "#fff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 10px 26px rgba(31, 24, 17, 0.08)",
  }),

  imageButton: {
    width: "100%",
    border: "none",
    background: "#f1eeea",
    padding: 0,
    aspectRatio: "1 / 1",
    cursor: "pointer",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  actionsRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 10px 12px",
  },

  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 600,
  },

  actionIcon: (isLiked) => ({
    fontSize: "1rem",
    color: isLiked ? "#de5d72" : "#b8ada7",
    transition: "transform 0.15s ease", // ✨ subtle polish
  }),

  commentIcon: (theme) => ({
    fontSize: "1rem",
    color: theme?.primary || "#7a8b6f",
  }),

  actionCount: {
    fontSize: "0.88rem",
  },
};
