"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PhotoModal from "../../components/PhotoModal";
import { themes } from "../themes";
import PhotoGrid from "../../components/PhotoGrid";
import CommentSheet from "../../components/CommentSheet";
import { useRouter } from "next/navigation";

const theme = themes.rustic;

export default function GalleryPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [commentIndex, setCommentIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(20);
  
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase.from("photos").select("*");
    setPhotos(data || []);
  };

  const displayedPhotos =
    activeTab === "loved"
      ? [...photos].sort((a, b) => (b.likes || 0) - (a.likes || 0))
      : photos;

  const visiblePhotos = displayedPhotos.slice(0, visibleCount);
  
  return (
  <main style={styles.container}>
    
    {/* MAIN CONTENT */}
    <div style={styles.card}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.hosts}>
          Emma & Jake’s Wedding Album
        </h1>

        <p style={styles.subtitle}>
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

        <button style={styles.tab}>
          Highlights
        </button>
      </div>

      {/* GRID */}
      <PhotoGrid
        photos={visiblePhotos}
        onPhotoClick={(index) => setSelectedIndex(index)}
        onCommentClick={(index) => setCommentIndex(index)}
        theme={theme}
      />

    </div>

    {/* IMAGE MODAL */}
    <PhotoModal
      photos={displayedPhotos}
      index={selectedIndex}
      onClose={setSelectedIndex}
    />

    {/* COMMENT SHEET */}
    <CommentSheet
      photo={
        commentIndex !== null
          ? displayedPhotos[commentIndex]
          : null
      }
      onClose={() => setCommentIndex(null)}
    />

    {/* BACK TO TOP BUTTON */}
      <button
  onClick={() =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  style={styles.backToTop}
>
  ↑ Top
</button>

    {/* FLOATING UPLOAD BUTTON */}
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
  container: {
    minHeight: "100vh",
    background: theme.background,
  },

  card: {
    padding: "16px",
},

header: {
    textAlign: "center",
    marginBottom: "12px",
  },

  hosts: {
    fontFamily: "Playfair Display, serif",
    fontSize: "26px",
    fontWeight: "600",
    color: theme.text,
    letterSpacing: "0.5px",
  },

  subtitle: {
    fontSize: "15px",
    color: theme.text,
    marginTop: "6px",
    fontStyle: "italic",
    opacity: 0.8,
  },

  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
    marginTop: "10px",
  },

  tab: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#eee",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    color: "#555",
  },

  activeTab: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#c6a46c",
    color: "#fff",
    border: "none",
    fontSize: "13px",
  },
  
  uploadBtn: {
  position: "fixed",
  bottom: "20px",
  right: "16px",

  display: "flex",
  alignItems: "center",
  gap: "8px",

  padding: "12px 16px",
  borderRadius: "999px",

  background: "#c6a46c", // theme gold
  color: "#fff",

  fontSize: "14px",
  fontWeight: "500",

  border: "none",
  cursor: "pointer",

  boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
},

  backToTop: {
  position: "fixed",
  bottom: "20px",
  left: "16px", // 👈 opposite side of upload

  display: "flex",
  alignItems: "center",
  gap: "6px",

  padding: "12px 14px",
  borderRadius: "999px",

  background: "#c6a46c",
  color: "#fff",

  fontSize: "13px",
  fontWeight: "500",

  border: "none",
  cursor: "pointer",

  boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
};
