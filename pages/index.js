"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
const [imageTitle, setImageTitle] = useState("");
const [imageFile, setImageFile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const addLink = async (e) => {
    e.preventDefault();
    if (!title || !url) return;
    await fetch("/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url }),
    });
    setTitle("");
    setUrl("");
    fetchLinks();
  };

  const openDeletePopup = (id) => {
    setDeleteId(id);
    setPopupOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    setPopupOpen(false);
    setDeleteId(null);
    fetchLinks();
  };
const uploadImage = async (e) => {
  e.preventDefault();

  if (!imageFile || !imageTitle) return;

  const formData = new FormData();

  formData.append("image", imageFile);

  const uploadRes = await fetch(
    "/api/upload-image",
    {
      method: "POST",
      body: formData,
    }
  );

  const uploadData = await uploadRes.json();

  if (!uploadData.url) {
  showToast("Upload failed", "error");
  return;
}

await fetch("/api/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: `IMG:${imageTitle}`,
    url: uploadData.url,
  }),
});

setImageTitle("");
setImageFile(null);

fetchLinks();

showToast("Image uploaded successfully", "success");
};
  const showToast = (message, type = "success") => {
  setToast({ show: true, message, type });

  setTimeout(() => {
    setToast({ show: false, message: "", type: "" });
  }, 2500);

  const sound =
    type === "success"
      ? new Audio("/sounds/success.mp3")
      : new Audio("/sounds/error.mp3");

  sound.play().catch(() => {});
};
  const openLink = (linkUrl) => {
    if (!/^https?:\/\//i.test(linkUrl)) {
      linkUrl = "https://" + linkUrl;
    }
    window.open(linkUrl, "_blank");
  };

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
        padding: 20,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 750,
          margin: "auto",
          background: "white",
          padding: "35px 32px",
          borderRadius: 22,
          boxShadow: "0 20px 45px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: 34, fontWeight: 800 }}>
          My Links
        </h1>

        {/* Input Form */}
        <form
          onSubmit={addLink}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 32,
            padding: 20,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 18,
            border: "1px solid #e2e8f0",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 25px rgba(37,99,235,0.06)",
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link Title"
            style={{
              padding: 15,
              borderRadius: 14,
              border: "1px solid #dbeafe",
              fontSize: 16,
              outline: "none",
            }}
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              padding: 15,
              borderRadius: 14,
              border: "1px solid #dbeafe",
              fontSize: 16,
              outline: "none",
            }}
          />

          <button
            style={{
              padding: 16,
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              color: "white",
              border: "none",
              borderRadius: 16,
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(59,130,246,0.3)",
              transition: "0.25s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.target.style.transform = "translateY(0px)")
            }
          >
            + Add Link
          </button>
        </form>
<form
  onSubmit={uploadImage}
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginBottom: 32,
    padding: 22,
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    background: "linear-gradient(145deg,#ffffff,#f8fafc)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  }}
>
  {/* Title */}
  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
    Upload Image
  </h3>

  {/* Image title */}
  <input
    value={imageTitle}
    onChange={(e) => setImageTitle(e.target.value)}
    placeholder="Image Title"
    style={{
      padding: 14,
      borderRadius: 12,
      border: "1px solid #dbeafe",
      outline: "none",
      fontSize: 14,
      background: "#fff",
    }}
  />

  {/* File input (styled wrapper) */}
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 8,
      padding: 14,
      borderRadius: 12,
      border: "1px dashed #93c5fd",
      background: "#f8fafc",
      cursor: "pointer",
    }}
  >
    <span style={{ fontSize: 13, color: "#64748b" }}>
      Choose Image File
    </span>

    <input
      type="file"
      accept="image/*"
      onChange={(e) => setImageFile(e.target.files[0])}
      style={{ fontSize: 13 }}
    />

    {/* preview file name */}
    {imageFile && (
      <div style={{ fontSize: 12, color: "#0f172a" }}>
        Selected: {imageFile.name}
      </div>
    )}
  </label>

  {/* Upload button */}
  <button
    type="submit"
    disabled={!imageFile}
    style={{
      padding: 14,
      borderRadius: 14,
      border: "none",
      fontWeight: 700,
      fontSize: 15,
      cursor: imageFile ? "pointer" : "not-allowed",
      background: imageFile
        ? "linear-gradient(135deg,#3b82f6,#6366f1)"
        : "#cbd5e1",
      color: "white",
      transition: "0.2s",
      opacity: imageFile ? 1 : 0.7,
    }}
  >
    {imageFile ? "Upload Image" : "Select Image First"}
  </button>
</form>
        {/* Links List */}
        <div>
          {links.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>
              No links saved yet.
            </div>
          ) : (
            links.map((link) => {
  const isImage = link.title.startsWith("IMG:");

  const displayTitle = isImage
    ? link.title.replace("IMG:", "")
    : link.title;

  // shorten URL (middle cut)
  const shortUrl =
    link.url.length > 45
      ? link.url.slice(0, 25) + "..." + link.url.slice(-15)
      : link.url;

  return (
    <div
      key={link._id}
      style={{
        padding: 18,
        background: "linear-gradient(145deg,#ffffff,#f1f5f9)",
        borderRadius: 16,
        marginBottom: 14,
        border: "1px solid #e2e8f0",
      }}
    >
      {/* TITLE */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 8,
          wordBreak: "break-word",
        }}
      >
        {displayTitle}
      </div>

      {/* URL + BUTTONS IN ONE LINE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* URL */}
        <div
          style={{
            color: "#64748b",
            fontSize: 13,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {shortUrl}
        </div>

        {/* BUTTON GROUP */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <a
            href={
              /^https?:\/\//i.test(link.url)
                ? link.url
                : `https://${link.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 16px",
              background: "#22d3ee",
              color: "white",
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            {isImage ? "View Image" : "GO"}
          </a>

          <button
            onClick={() => openDeletePopup(link._id)}
            style={{
              padding: "8px 16px",
              background: "#fb7185",
              color: "white",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
})
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {popupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg,#ffffff,#f1f5f9)",
              padding: 30,
              borderRadius: 24,
              width: 340,
              textAlign: "center",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              animation: "popupScale 0.25s ease",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              Delete this link?
            </div>

            <p style={{ color: "#6b7280", marginTop: 8 }}>
              This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <button
                onClick={confirmDelete}
                style={{
                  background: "#fb7185",
                  border: "none",
                  color: "white",
                  padding: "10px 22px",
                  borderRadius: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>

              <button
                onClick={() => setPopupOpen(false)}
                style={{
                  background: "#94a3b8",
                  border: "none",
                  color: "white",
                  padding: "10px 22px",
                  borderRadius: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

            {toast.show && (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      padding: "12px 18px",
      borderRadius: 12,
      color: "white",
      fontWeight: 600,
      background:
        toast.type === "success"
          ? "linear-gradient(135deg,#22c55e,#16a34a)"
          : "linear-gradient(135deg,#ef4444,#b91c1c)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      zIndex: 9999,
      animation: "fadeIn 0.2s ease",
    }}
  >
    {toast.message}
  </div>
)}
    </div>
  );
}
