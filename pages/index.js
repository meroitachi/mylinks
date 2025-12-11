"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  };

  useEffect(() => {
  const checkRedirect = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();

    // Look for title === "redirect"
    const redirectItem = data.find(item => item.title.toLowerCase() === "redirect");

    if (redirectItem) {
      let target = redirectItem.url;

      // Ensure valid http/https
      if (!/^https?:\/\//i.test(target)) {
        target = "https://" + target;
      }

      window.location.href = target; // 🔥 full-page redirect
      return;
    }

    setLinks(data); // Only set links if not redirecting
  };

  checkRedirect();
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

  const openLink = (linkUrl) => {
    // Ensure URL starts with http/https
    if (!/^https?:\/\//i.test(linkUrl)) {
      linkUrl = "https://" + linkUrl;
    }
    window.open(linkUrl, "_blank");
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#f1f5f9", padding: 20 }}>
      <div
        style={{
          maxWidth: 750,
          margin: "auto",
          background: "white",
          padding: "35px 32px",
          borderRadius: 18,
          boxShadow: "0 15px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: 34, fontWeight: 800, marginBottom: 8 }}>
          My Links
        </h1>
        <div style={{ textAlign: "center", color: "#6b7280", marginBottom: 28, fontSize: 15 }}>
          Store & manage your links instantly (MongoDB sync).
        </div>

        {/* Input Form */}
        <form
          onSubmit={addLink}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 32,
            padding: 18,
            background: "rgba(241,245,249,0.6)",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            backdropFilter: "blur(6px)",
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link Title"
            style={{
              padding: 15,
              borderRadius: 12,
              border: "1px solid #ccd4e0",
              fontSize: 16,
              outline: "none",
              transition: "0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#ccd4e0")}
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              padding: 15,
              borderRadius: 12,
              border: "1px solid #ccd4e0",
              fontSize: 16,
              outline: "none",
              transition: "0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#ccd4e0")}
          />

          <button
            style={{
              padding: 16,
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.background = "#2563eb")}
          >
            + Add Link
          </button>
        </form>

        {/* Links List */}
        <div>
          {links.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>
              No links saved yet.
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 18,
                  background: "#f8fafc",
                  borderRadius: 12,
                  marginBottom: 12,
                  border: "1px solid #e2e8f0",
                  transition: "0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{link.title}</div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>{link.url}</div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => openLink(link.url)}
                    style={{
                      padding: "10px 22px",
                      background: "#0ea5e9",
                      color: "white",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "#0284c7")}
                    onMouseLeave={(e) => (e.target.style.background = "#0ea5e9")}
                  >
                    GO
                  </button>

                  <button
                    onClick={() => openDeletePopup(link._id)}
                    style={{
                      padding: "10px 22px",
                      background: "#ef4444",
                      color: "white",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "#dc2626")}
                    onMouseLeave={(e) => (e.target.style.background = "#ef4444")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {popupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 26,
              borderRadius: 16,
              width: 320,
              textAlign: "center",
              boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
              animation: "scaleIn 0.25s",
            }}
          >
            <div style={{ fontSize: 21, fontWeight: 700 }}>Delete this link?</div>
            <p style={{ color: "#6b7280", marginTop: 6, marginBottom: 20 }}>
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={confirmDelete}
                style={{
                  background: "#ef4444",
                  border: "none",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                Delete
              </button>

              <button
                onClick={() => setPopupOpen(false)}
                style={{
                  background: "#6b7280",
                  border: "none",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
