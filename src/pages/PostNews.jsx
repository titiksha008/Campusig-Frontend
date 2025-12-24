// frontend/pages/PostNews.jsx
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./PageNew.css";

export default function PostNews() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Title and Content are required");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/news",
        {
          title,
          content,
          image,
          tags: tags.split(",").map(tag => tag.trim()),
          category,
        },
        { withCredentials: true }
      );

      alert("News posted successfully!");
      navigate("/news");
    } catch (err) {
      alert("Failed to post news.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="post-news-login-msg">Please login to post news.</p>;

  return (
    <div className="post-news-container">
      <h2 className="post-news-heading">Post Local News</h2>

      <form className="post-news-form" onSubmit={handleSubmit}>
        <input
          className="post-news-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />

        <textarea
          className="post-news-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          rows={6}
          required
        />

        <input
          className="post-news-input"
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL (optional)"
        />

        <input
          className="post-news-input"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
        />

        <select
          className="post-news-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="general">General</option>
          <option value="events">Events</option>
          <option value="sports">Sports</option>
        </select>

        <button
        type="submit"
        className="post-news-btn"
        disabled={loading}
        >
        {loading ? "Posting..." : "Post News"}
        </button>
      </form>
    </div>
  );
}