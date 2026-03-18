
export default function UploadPage() {
  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Upload Your Photos</h1>
        <p style={styles.subtitle}>
          Scan, upload & share your memories 📸
        </p>

        <input type="file" multiple style={styles.input} />

        <button style={styles.button}>
          Upload Photos
        </button>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
  },
  input: {
    marginBottom: "20px",
  },
  button: {
    background: "#f4a261",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
  },
};
