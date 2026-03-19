"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PhotoModal from "../../components/PhotoModal";
import { themes } from "../themes";

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
      ? [...photos].sort((a, b) => b.likes - a.likes)
      : photos;

  return (
    <main style={styles.container}>
      
      {/* CARD */}
      <div style={styles.card}>

        {/* TITLE */}
        <h2 style={styles.title}>Wedding Album</h2>

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
        <div style={styles.grid}>
          {displayedPhotos.map((photo, index) => (
            <img
              key={photo.id}
              src={`${photo.url}?width=600`}
              style={styles.image}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div style={styles.bottomBar}>
          <span>❤️ Most Loved</span>
          <span>🎞 Slideshow</span>
          <span>🔴 Live Feed</span>
        </div>

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
  },

  title: {
    textAlign: "center",
    color: theme.text,
    marginBottom: "10px",
  },

  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "15px",
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
    background: theme.primary,
    color: "#fff",
    border: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },

  image: {
    width: "100%",
    borderRadius: "10px",
    cursor: "pointer",
  },

  bottomBar: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "15px",
    fontSize: "14px",
    color: theme.text,
  },
};
