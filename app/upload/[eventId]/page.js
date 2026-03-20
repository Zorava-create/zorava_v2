"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function UploadPage() {
  const params = useParams();
  const eventId = params.eventId;

  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  // 📸 SELECT FILES
  function handleFileSelect(e) {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);

    if (selected.length > 30) {
      alert("Maximum 30 photos per upload");
      return;
    }

    setFiles(selected);

    const urls = selected.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  }

  // ❌ REMOVE IMAGE
  function removeImage(index) {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  }

  // 🔐 HASH (duplicate prevention)
  async function generateHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // 🔁 RETRY UPLOAD
  async function uploadWithRetry(path, file) {
    let { error } = await supabase.storage
      .from("photos")
      .upload(path, file);

    if (error) {
      await new Promise((r) => setTimeout(r, 1500));

      const retry = await supabase.storage
        .from("photos")
        .upload(path, file);

      return retry.error;
    }

    return null;
  }

  // 🚀 MAIN UPLOAD
  async function uploadPhotos() {
    if (files.length === 0) return;

    setUploading(true);
    window.onbeforeunload = () => true;

    let uploaded = 0;
    const total = files.length;

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 20 * 1024 * 1024) continue;

      // 🔐 HASH
      const hash = await generateHash(file);

      // ⚠️ DUPLICATE CHECK (optional – skip for now or keep later)
      // (You can reintroduce if you add image_hash column)

      // 🗜 COMPRESS
      const compressed = file;
      const filePath = `${eventId}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "_")}`;

      // 📤 UPLOAD
      const uploadError = await uploadWithRetry(filePath, compressed);

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      // 🔗 GET PUBLIC URL
      const { data } = supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // 💾 INSERT INTO DB
      const { error: dbError } = await supabase
        .from("photos")
        .insert({
          event_id: eventId,
          url: publicUrl,
          likes: 0,
        });

      if (dbError) {
        console.error("DB ERROR:", dbError);
      }

      uploaded++;
      setProgress(Math.round((uploaded / total) * 100));
    }

    window.onbeforeunload = null;

    setUploading(false);
    setFiles([]);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
    setComplete(true);
  }

  // 🔁 RESET
  function resetUpload() {
    setComplete(false);
    setProgress(0);
  }

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        <h1 style={{ textAlign: "center" }}>
          Upload to {eventId}
        </h1>

        {complete ? (
          <div style={{ textAlign: "center" }}>
            <h2>✓ Uploaded</h2>
            <button onClick={resetUpload}>Upload More</button>
          </div>
        ) : (
          <>
            <input
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "20px" }}
            />

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />

            {/* PREVIEW */}
            {previews.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                {previews.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img
                      src={src}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      onClick={() => removeImage(i)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={uploadPhotos}
              disabled={uploading || files.length === 0}
              style={{ marginTop: "20px" }}
            >
              {uploading ? `Uploading ${progress}%` : "Upload Photos"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
