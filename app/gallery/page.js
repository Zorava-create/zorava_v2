"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PhotoModal from "../../components/PhotoModal";
import { themes } from "../themes";
import PhotoGrid from "../../components/PhotoGrid";

const theme = themes.rustic;

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase.from("photos").select("*");
    setPhotos(data || []);
  };

  // 👉 Sort for Most Loved
  const displayedPhotos =
    activeTab === "loved"
      ? [...photos].sort((a, b) => (b.likes || 0) - (a.likes || 0))
      : photos;

  return (
    <main style={styles.container}>
      
      {/* CARD CONTAINER */}
      <div style={styles.card}>

        {/* ✅ PREMIUM HEADER */}
        <div style={styles.header}>
          <h1 style={styles.hosts}>
            Emma & Jake
          </h1>

          <p style={styles.subtitle}>
            Wedding Album
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
          photos={displayedPhotos}
          onPhotoClick={(index) => setSelectedIndex(index)}
          theme={theme}
        />

      </div>

      {/* MODAL */}
      <PhotoModal
        photos={displayedPhotos}
        index={selectedIndex}
        onClose={setSelectedIndex}
      />

    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: theme.background,
    display: "flex",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    background: theme.card,
    borderRadius: "20px",
    padding: "20px",
    maxWidth: "600px",
    width: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },

  // ✅ NEW HEADER
  header: {
    textAlign: "center",
    marginBottom: "10px",
  },

  hosts: {
    fontFamily: "Playfair Display, serif",
    fontSize: "24px",
    fontWeight: "600",

    background: "linear-gradient(90deg, #c6a46c, #e7d3a3)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",

    letterSpacing: "0.5px",
  },

  subtitle: {
    fontSize: "14px",
    color: theme.text,
    marginTop: "4px",
    fontStyle: "italic",
  },

  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "15px",
    marginTop: "10px",
  },

  tab: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#eee",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
  },

  activeTab: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: theme.primary,
    color: "#fff",
    border: "none",
    fontSize: "13px",
  },
};
