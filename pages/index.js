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
                  background: "linear-gradient(145deg,#ffffff,#f1f5f9)",
                  borderRadius: 16,
                  marginBottom: 14,
                  border: "1px solid #e2e8f0",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(0,0,0,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "none")
                }
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {link.title}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: 13,
                      marginTop: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {link.url}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginLeft: 12 }}>
                  <button
                    onClick={() => openLink(link.url)}
                    style={{
                      padding: "10px 20px",
                      background: "#22d3ee",
                      color: "white",
                      borderRadius: 14,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    GO
                  </button>

                  <button
                    onClick={() => openDeletePopup(link._id)}
                    style={{
                      padding: "10px 20px",
                      background: "#fb7185",
                      color: "white",
                      borderRadius: 14,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
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
    </div>
  );
}
