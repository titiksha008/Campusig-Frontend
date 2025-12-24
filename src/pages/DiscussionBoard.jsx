// pages/DiscussionBoard.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getAllDiscussions, createDiscussion } from "../services/discussionApi";
import { useAuth } from "../context/AuthContext";
import "./discussion.css";

const INITIAL_LIMIT = 2;
const FETCH_ALL_LIMIT = 10000;

export default function DiscussionBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // full data
  const [allDiscussions, setAllDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);

  // UI state
  const [showAll, setShowAll] = useState(false);
  const [filteredDiscussions, setFilteredDiscussions] = useState(null);
  const [creating, setCreating] = useState(false);

  // form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [files, setFiles] = useState([]);

  const topRef = useRef(null);

  // Fetch ALL posts once
  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getAllDiscussions(`?page=1&limit=${FETCH_ALL_LIMIT}`);
      const arr = Array.isArray(res?.data?.discussions) ? res.data.discussions : [];
      setAllDiscussions(arr);

      const allTags = Array.from(
        new Set(arr.flatMap((d) => (Array.isArray(d.tags) ? d.tags : [])))
      );
      setAvailableTags(allTags);
    } catch (err) {
      console.error("Failed to load discussions:", err);
      alert("Failed to load discussions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Sync URL tag filter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tag") || "";

    if (t) {
      setSelectedTag(t);
      const matched = allDiscussions.filter(
        (p) => Array.isArray(p.tags) && p.tags.includes(t)
      );
      setFilteredDiscussions(matched);
      setShowAll(true);

      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else {
      setSelectedTag("");
      setFilteredDiscussions(null);
    }
  }, [location.search, allDiscussions]);

  // Visible items
  const visibleItems = (() => {
    if (selectedTag && filteredDiscussions) return filteredDiscussions;
    if (showAll) return allDiscussions;
    return allDiscussions.slice(0, INITIAL_LIMIT);
  })();

  const handleTagClick = (tag) => {
    if (!tag) {
      navigate(window.location.pathname, { replace: true });
      setSelectedTag("");
      setFilteredDiscussions(null);
      return;
    }
    navigate(`?tag=${encodeURIComponent(tag)}`, { replace: true });
  };

  const openDiscussion = (id) => navigate(`/discussion/${id}`);

  const toggleShowAll = () => {
    const next = !showAll;
    setShowAll(next);

    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  // ---------------------------
  // ⭐ UPDATED SUBMIT WITH FILES
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return alert("You must be logged in to post.");
    if (!title.trim() || !content.trim()) return alert("Title & content required.");

    try {
      setCreating(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());

      const tagList = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      tagList.forEach((t) => formData.append("tags", t));

      // Add attachments
      files.forEach((file) => formData.append("attachments", file));

      const res = await createDiscussion(formData);

      // Add newly created post to list
      setAllDiscussions((prev) => [res.data, ...prev]);

      // Add new tags
      if (tagList.length) {
        setAvailableTags((prev) => Array.from(new Set([...(prev || []), ...tagList])));
      }

      // Reset form
      setTitle("");
      setContent("");
      setTagsInput("");
      setFiles([]);

      setShowAll(true);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (err) {
      console.error("Create failed:", err);
      alert("Could not post discussion.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="discussion-container" ref={topRef}>
      <h2 className="discussion-title">Campus Gig Discussion Board 💬</h2>

      {selectedTag && (
        <div className="selected-tag-banner">
          Showing: <strong>#{selectedTag}</strong>
          <button className="clear-tag-btn" onClick={() => handleTagClick("")}>
            Clear
          </button>
        </div>
      )}

      {/* TAG BAR */}
      <div className="tag-bar">
        <span className="filter-label">Filter:</span>

        {availableTags.length === 0 && !loading ? (
          <span className="no-posts">No tags yet</span>
        ) : (
          availableTags.map((t) => (
            <button
              key={t}
              className={`tag-pill ${t === selectedTag ? "tag-selected" : ""}`}
              onClick={() => handleTagClick(t)}
              type="button"
            >
              {t}
            </button>
          ))
        )}

        <button className="tag-clear" onClick={() => handleTagClick("")}>
          Clear
        </button>
      </div>

      {/* LOADING */}
      {loading && <Skeleton count={INITIAL_LIMIT} height={90} className="skeleton-loader" />}

      {/* LIST */}
      <div className={`discussion-list ${showAll ? "expanded" : "collapsed"}`}>
        {visibleItems.length === 0 && !loading ? (
          <p className="no-posts">No discussions yet. Start the conversation!</p>
        ) : (
          visibleItems.map((d) => (
            <div key={d._id} className="discussion-card" onClick={() => openDiscussion(d._id)}>
              <h3 className="discussion-card-title">
                {d.title || d.content?.slice(0, 120) || "Untitled"}
              </h3>

              <p className="discussion-card-content">
                {d.content?.length > 140 ? d.content.substring(0, 140) + "..." : d.content}
              </p>

              <div className="tag-container">
                {Array.isArray(d.tags) &&
                  d.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`tag ${selectedTag === tag ? "tag-selected" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagClick(tag);
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
              </div>

              <div className="meta-info">
                <span>👤 {d.author?.name || "Unknown"}</span>
                <span>
                  💬 {Array.isArray(d.comments) ? d.comments.length : d.commentsCount ?? 0} replies
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SEE MORE */}
      {allDiscussions.length > INITIAL_LIMIT && (
        <button className="see-more-btn" onClick={toggleShowAll}>
          {showAll ? "See Less" : `See More (${allDiscussions.length - INITIAL_LIMIT} more)`}
        </button>
      )}

      <hr className="divider" />

      {/* -----------------------------
          CREATE DISCUSSION FORM
      ------------------------------ */}
      <div className="discussion-form-card">
        <h3 className="section-title">📝 Start a New Discussion</h3>

        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="text"
            placeholder="Post Title"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Write your question or topic..."
            className="textarea-field"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            className="input-field"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          {/* ⭐ FILE INPUT */}
          <input
            type="file"
            multiple
            className="input-field"
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />

          {/* ⭐ FILE PREVIEW */}
          {files.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 }}>
              {files.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    fontSize: 12,
                  }}
                >
                  {f.name}
                  <button
                    style={{
                      display: "block",
                      marginTop: 6,
                      background: "transparent",
                      color: "#b22",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setFiles(files.filter((_, idx) => idx !== i));
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="post-btn" type="submit" disabled={creating}>
            {creating ? "Posting..." : "Post Discussion"}
          </button>
        </form>
      </div>
    </div>
  );
}
