export default function PhotoModal({ photos, index, onClose }) {
  if (index === null || !photos[index]) return null;

  const photo = photos[index];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <img src={photo.url} style={styles.image} />
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  image: {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: "12px",
  },
};
