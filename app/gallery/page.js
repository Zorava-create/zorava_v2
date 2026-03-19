"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoGrid from "../../components/PhotoGrid";
import PhotoModal from "../../components/PhotoModal";
import CommentSheet from "../../components/CommentSheet";
import { supabase } from "../../lib/supabaseClient";
import { themes } from "../themes";

const theme = themes.rustic;
const EVENT_ID = "emma-jake-wedding";
const PAGE_SIZE = 20;
const [hostNames, setHostNames] = useState("");

// 🔥 Merge comment counts into photos
function mergeCommentCounts(photosData = [], commentsData = []) {
  const countMap = {};

  commentsData.forEach((c) => {
    countMap[c.photo_id] = (countMap[c.photo_id] || 0) + 1;
  });

  return photosData.map((photo) => ({
    ...photo,
    comment_count: countMap[photo.id] || 0,
  }));
}

export default function GalleryPage() {
  const router = useRouter();

  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [commentPhotoIndex, setCommentPhotoIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 🔥 Fetch photos + comment counts
  const refreshGallery = useCallback(async () => {
    const [{ data: photosData }, { data: commentsData }] =
      await Promise.all([
        supabase
          .from("photos")
          .select("*")
          .eq("event_id", EVENT_ID)
          .order("created_at", { ascending: false }),
        supabase.from("comments").select("photo_id"),
      ]);

    const merged = mergeCommentCounts(
      photosData || [],
      commentsData || []
    );

    setPhotos(merged);
  }, []);

  useEffect(() => {
    refreshGallery();
  }, [refreshGallery]);

  // 🔥 Sorting
  const displayedPhotos = useMemo(() => {
    if (activeTab === "loved") {
      return [...photos].sort(
        (a, b) => (b.likes || 0) - (a.likes || 0)
      );
    }
    return photos;
  }, [photos, activeTab]);

  // 🔥 Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setVisibleCount((prev) =>
          Math.min(prev + PAGE_SIZE, displayedPhotos.length)
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayedPhotos.length]);

  const visiblePhotos = displayedPhotos.slice(0, visibleCount);

  const selectedPhoto =
    selectedPhotoIndex !== null
      ? visiblePhotos[selectedPhotoIndex]
      : null;

  const commentPhoto =
    commentPhotoIndex !== null
      ? visiblePhotos[commentPhotoIndex]
      : null;

  // 🔥 Like handler (SAFE, no mutation)
  const handlePhotoLikeToggle = async (photoId, shouldLike) => {
    const target = photos.find((p) => p.id === photoId);
    if (!target) return;

    const newLikes = shouldLike
      ? (target.likes || 0) + 1
      : Math.max((target.likes || 0) - 1, 0);

    // instant UI update
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, likes: newLikes } : p
      )
    );

    await supabase
      .from("photos")
      .update({ likes: newLikes })
      .eq("id", photoId);
  };

  return (
    <main style={styles.page(theme)}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title(theme)}>
          Emma & Jake’s Wedding Album
        </h1>
        <p style={styles.subtitle(theme)}>
          Captured moments from your special day
        </p>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          style={activeTab === "all" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("all")}
        >
          All Photos
        </button>

        <button
          style={activeTab === "loved" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("loved")}
        >
          Most Loved ❤️
        </button>

        <button style={styles.tab}>Highlights</button>
      </div>

      {/* GRID */}
      <PhotoGrid
        photos={visiblePhotos}
        onPhotoClick={setSelectedPhotoIndex}
        onCommentClick={setCommentPhotoIndex}
        onToggleLike={handlePhotoLikeToggle}
        theme={theme}
      />

      {/* MODAL */}
      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhotoIndex(null)}
      />

      {/* COMMENTS */}
      <CommentSheet
        photo={commentPhoto}
        onClose={() => setCommentPhotoIndex(null)}
        onCommentsChanged={refreshGallery}
      />

      {/* BACK TO TOP */}
      <button
        style={styles.topButton}
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      >
        ↑ Top
      </button>

      {/* UPLOAD BUTTON */}
      <button
        style={styles.uploadBtn}
        onClick={() => router.push("/upload")}
      >
        📷 Upload Images
      </button>

    </main>
  );
}

const styles = {
  page: (theme) => ({
    minHeight: "100vh",
    background: theme.background,
    padding: "16px",
  }),

  header: {
    textAlign: "center",
    marginBottom: "16px",
  },

  title: (theme) => ({
    fontFamily: "Playfair Display, serif",
    fontSize: "26px",
    color: theme.text,
  }),

  subtitle: (theme) => ({
    fontSize: "14px",
    color: theme.text,
    opacity: 0.7,
  }),

  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
  },

  tab: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#eee",
    border: "none",
    cursor: "pointer",
  },

  activeTab: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#c6a46c",
    color: "#fff",
    border: "none",
  },

  uploadBtn: {
    position: "fixed",
    bottom: "20px",
    right: "16px",
    padding: "12px 16px",
    borderRadius: "999px",
    background: "#c6a46c",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  topButton: {
    position: "fixed",
    bottom: "20px",
    left: "16px",
    padding: "12px 14px",
    borderRadius: "999px",
    background: "#c6a46c",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
