import { themes } from "../themes";

// 👉 Change this to test different themes:
// classic | blush | rustic | luxe | pride | winter | midnight
const theme = themes.rustic;

export default function UploadPage() {
  return (
    <main style={styles.container}>
      
      <div style={styles.card}>
        
        <h1 style={styles.title}>
          Emma & Jake’s Wedding
        </h1>

        <p style={styles.subtitle}>
          Share your photos from our special day.
        </p>

        <button style={styles.uploadButton}>
          📷 Upload Photos
        </button>

        <p style={styles.link}>
          ❤️ View Gallery
        </p>

        <p style={styles.footer}>
          No app needed · Takes seconds
        </p>

      </div>

    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: theme.background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    background: theme.card,
    padding: "40px 30px",
    borderRadius: "18px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
    textAlign: "center",
    width: "100%",
    maxWidth: "420px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "500",
    color: theme.text,
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "14px",
    color: theme.subtext,
    marginBottom: "25px",
  },

  uploadButton: {
    background: theme.primary,
    color: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: "10px",
    width: "100%",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
    marginBottom: "15px",
  },

  link: {
    fontSize: "14px",
    color: theme.text,
    cursor: "pointer",
    marginBottom: "20px",
  },

  footer: {
    fontSize: "12px",
    color: theme.subtext,
  },
};
