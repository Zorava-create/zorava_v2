export default function UploadPage() {
  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Zorava</h1>
        <p style={styles.tagline}>Scan. Upload. Share Memories.</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Add Your Moments 📸</h2>
        <p style={styles.subtitle}>
          Upload your photos and be part of the story
        </p>

        <label style={styles.uploadBox}>
          <input type="file" multiple style={{ display: "none" }} />
          <span style={styles.uploadText}>Tap to upload photos</span>
        </label>

        <button style={styles.button}>
          Upload Now
        </button>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#fdf6f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "600",
  },
  tagline: {
    fontSize: "14px",
    color: "#888",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    textAlign: "center",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#777",
    marginBottom: "20px",
  },
  uploadBox: {
    border: "2px dashed #f4a261",
    padding: "30px",
    borderRadius: "12px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  uploadText: {
    color: "#f4a261",
    fontWeight: "500",
  },
  button: {
    background: "#f4a261",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    width: "100%",
    fontSize: "16px",
    cursor: "pointer",
  },
};
