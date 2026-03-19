"use client";
import PhotoGrid from "../../components/PhotoGrid";
import PhotoModal from "../../components/PhotoModal";
import Slideshow from "../../components/Slideshow";
import { themes }from "../themes";

const theme = themes.classic;

export default function GalleryPage() {
  return ( 
    <main style={styles.container}>
    <h1 style={styles.title}>Gallery</h1>

  <PhotoGrid />
  <PhotoModal />
  <Slideshow />
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: theme.background,
    padding: "20px",
  },
};
