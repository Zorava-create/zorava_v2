"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PhotoGrid from "../../components/PhotoGrid";
import PhotoModal from "../../components/PhotoModal";
import Slideshow from "../../components/Slideshow";
import { themes } from "../themes";

const theme = themes.classic;

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // 👉 Fetch photos
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPhotos(data);
    }
  };

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Emma & Jake’s Gallery</h1>

      <PhotoGrid
        photos={photos}
        onPhotoClick={(index) => setSelectedIndex(index)}
        theme={theme}
      />

      <PhotoModal
        photos={photos}
        index={selectedIndex}
        onClose={() => setSelectedIndex(null)}
      />

      <Slideshow photos={photos} />
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: theme.background,
    padding: "20px",
  },
  title: {
    color: theme.text,
    marginBottom: "20px",
  },
};
