// src/pages/SingleDiscussionPost.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  getDiscussionById,
  addReplyToDiscussion,
  toggleLikeOnComment,
  // toggleSolutionOnComment // removed — UI no longer uses solutions
} from "../services/discussionApi";
import { useAuth } from "../context/AuthContext";
import "./discussion.css";

function buildTree(comments) {
  // comments: flat array with _id and parentId
  const map = {};
  comments.forEach((c) => (map[c._id] = { ...c, children: [] }));
  const roots = [];
  comments.forEach((c) => {
    if (c.parentId) {
      const parent = map[c.parentId];
      if (parent) parent.children.push(map[c._id]);
      else roots.push(map[c._id]); // fallback
    } else {
      roots.push(map[c._id]);
    }
  });
  // sort children by createdAt asc
  const sortRec = (arr) => {
    arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    arr.forEach((ch) => sortRec(ch.children));
  };
  sortRec(roots);
  return roots;
}

function Attachment({ a }) {
  // a: { url, fileType }
  if (!a || !a.url) return null;
  const url = a.url;
  if (a.fileType === "image") {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt="attachment" className="attachment-thumb" />
      </a>
    );
  }
  return (
    <div className="attachment-file">
      <a href={url} target="_blank" rel="noreferrer">
        {a.fileType === "pdf" ? "📄 PDF" : "📎 Attachment"}
      </a>
    </div>
  );
}

export default function SingleDiscussionPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeReplyTo, setActiveReplyTo] = useState(null); // commentId or null for top-level
  const fileInputRef = useRef(null);

  const fetchPost = async () => {
    try {
      setLoadingPost(true);
      const res = await getDiscussionById(id);
      setPost(res.data);
    } catch (err) {
      console.error("Error fetching single discussion:", err);
      alert("Failed to load post.");
    } finally {
      setLoadingPost(false);
    }
  };

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const commentsTree = useMemo(() => {
    if (!post?.comments) return [];
    return buildTree(post.comments.map((c) => ({ ...c, _id: c._id.toString() })));
  }, [post]);

  const openTag = (tag) => {
    navigate(`/?tag=${encodeURIComponent(tag)}`);
  };

  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setReplyFiles((prev) => [...prev, ...files].slice(0, 6)); // max 6
    // reset input so same file can be added later
    e.target.value = "";
  };

  const removeFile = (index) => {
    setReplyFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReply = async (parentId = null) => {
    if (!user) return alert("Login required.");
    if (!replyText.trim() && replyFiles.length === 0) {
      return alert("Write something or attach a file.");
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("text", replyText.trim());
      if (parentId) fd.append("parentId", parentId);
      replyFiles.forEach((f) => fd.append("attachments", f));
      await addReplyToDiscussion(id, fd);
      setReplyText("");
      setReplyFiles([]);
      setActiveReplyTo(null);
      await fetchPost();
    } catch (err) {
      console.error("Reply failed:", err);
      alert("Reply failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return alert("Login required.");
    try {
      await toggleLikeOnComment(id, commentId);
      await fetchPost();
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  if (loadingPost || !post) return <p>Loading...</p>;

  return (
    <div className="post-detail-container">
      <div className="post-detail-box">
        <h2 className="post-detail-title">{post.title}</h2>
        <div className="post-detail-content">{post.content}</div>

        <div className="post-detail-tags">
          {post.tags?.map((t, i) => (
            <button key={i} className="post-detail-tag" onClick={() => openTag(t)}>
              #{t}
            </button>
          ))}
        </div>

        <div className="post-user">👤 {post.author?.name}</div>
      </div>

      <div className="replies-section">
        <div className="replies-header">💬 Replies</div>

        {/* Nested comment renderer */}
        <div className="reply-list">
          {commentsTree.length === 0 ? (
            <p className="no-replies">No replies yet.</p>
          ) : (
            <CommentTree
              nodes={commentsTree}
              onReplyClick={(cId) => {
                setActiveReplyTo(cId);
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
              }}
              onLike={handleLike}
              currentUser={user}
            />
          )}
        </div>

        {/* Reply composer (for top-level or reply-to specific comment) */}
        <div className="reply-box-container">
          {activeReplyTo && (
            <div className="reply-to-note">
              Replying to comment <strong>{activeReplyTo}</strong>{" "}
              <button onClick={() => setActiveReplyTo(null)}>Cancel</button>
            </div>
          )}

          <textarea
            className="reply-box"
            placeholder={activeReplyTo ? "Write a reply to selected comment..." : "Write a reply..."}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onFilesChange}
              style={{ display: "none" }}
              id="reply-files"
            />
            <button
              className="post-btn"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Attach files
            </button>

            <button
              className="reply-btn"
              onClick={() => submitReply(activeReplyTo)}
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post Reply"}
            </button>
          </div>

          {replyFiles.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {replyFiles.map((f, i) => (
                <div key={i} style={{ padding: 8, borderRadius: 8, border: "1px solid #eee", minWidth: 80 }}>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>{f.name}</div>
                  <button
                    style={{ fontSize: 12, color: "#b33", background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => removeFile(i)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- CommentTree component (render tree recursively) --- */
function CommentTree({ nodes, onReplyClick, onLike, currentUser }) {
  return (
    <div>
      {nodes.map((node) => (
        <CommentNode
          key={node._id}
          node={node}
          depth={0}
          onReplyClick={onReplyClick}
          onLike={onLike}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
}

function CommentNode({ node, depth = 0, onReplyClick, onLike, currentUser }) {
  const likesCount = (node.likes || []).length;
  const likedByMe = currentUser && (node.likes || []).some((id) => id.toString() === currentUser._id.toString());

  return (
    <div style={{ marginLeft: depth * 20 + "px", marginBottom: 12 }}>
      <div className="reply-item">
        <div className="reply-header">
          <div>
            <div className="reply-user">{node.user?.name || "User"}</div>
            <div className="reply-date">{node.createdAt ? `${formatDistanceToNow(new Date(node.createdAt))} ago` : ""}</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="see-more-btn"
              style={{ background: likedByMe ? "#3e32db" : "#e6e3ff", color: likedByMe ? "#fff" : "#3e32db", padding: "6px 8px", fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                onLike(node._id);
              }}
              type="button"
            >
              👍 {likesCount}
            </button>

            <button
              className="post-btn"
              onClick={(e) => {
                e.stopPropagation();
                onReplyClick(node._id);
              }}
              type="button"
              style={{ background: "#6b63ff", padding: "6px 10px", fontSize: 13 }}
            >
              Reply
            </button>
          </div>
        </div>

        <div className="reply-text">{node.text}</div>

        {/* attachments */}
        {node.attachments?.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {node.attachments.map((a, i) => (
              <Attachment key={i} a={a} />
            ))}
          </div>
        )}
      </div>

      {/* children */}
      {node.children && node.children.length > 0 && (
        <div className="reply-nested" style={{ marginTop: 8 }}>
          {node.children.map((child) => (
            <CommentNode
              key={child._id}
              node={child}
              depth={depth + 1}
              onReplyClick={onReplyClick}
              onLike={onLike}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
