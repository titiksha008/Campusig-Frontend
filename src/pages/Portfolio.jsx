import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify"; 
import "./Portfolio.css";

const Portfolio = () => {
  const { userId } = useParams(); 
  const { user } = useAuth(); 
  const loggedInUserId = user?._id;

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", link: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [hasFetched, setHasFetched] = useState(false); // prevent duplicate toast

  const isOwner = loggedInUserId === userId;

  const fetchPortfolio = async () => {
    try {
      // FIX: Use backticks for template literals in the API path
      const res = await api.get(`/portfolio/${userId}`);
      setProjects(res.data.projects || []);
      setOwnerName(res.data.ownerName || "User");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load portfolio");
      if (!hasFetched) toast.error("Failed to load portfolio"); // only once
    } finally {
      setHasFetched(true);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("link", form.link);
      if (file) formData.append("file", file);

      await api.post("/portfolio", formData, {
        headers: {
          // FIX: Use backticks for the Authorization header value
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setForm({ title: "", description: "", link: "" });
      setFile(null);
      toast.success("Project added successfully"); 
      fetchPortfolio(); 
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to add project");
      toast.error("Failed to add project"); 
    }
  };

  const handleDelete = async (id) => {
    try {
      // FIX: Use backticks for template literals in the API path
      await api.delete(`/portfolio/${id}`, {
        headers: {
          // FIX: Use backticks for the Authorization header value
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProjects(projects.filter((p) => p._id !== id));
      toast.success("Project deleted successfully"); 
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete project");
      toast.error("Failed to delete project"); 
    }
  };

  return (
    <div className="portfolio-container">
      {/* FIX: Use backticks for the ownerName variable */}
      <h2>{isOwner ? "My Portfolio" : `${ownerName}'s Portfolio`}</h2>

      {isOwner && (
        <form onSubmit={handleSubmit} className="portfolio-form">
          <input
            type="text"
            placeholder="Project Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Project Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Project Link (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.png"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit">Add Project</button>
        </form>
      )}

      {error && <p className="error-message">{error}</p>}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p className="text-center">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <div key={p._id} className="project-card">
              <h3>{p.title}</h3>
              <p>{p.description}</p>

              {p.link && (
                <a href={p.link} target="_blank" rel="noopener noreferrer">
                  View Project
                </a>
              )}

              {p.fileUrl && (
                <a
                  // FIX: Use backticks for the full URL
                  href={`http://localhost:5000${p.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download File
                </a>
              )}

              {isOwner && (
                <button onClick={() => handleDelete(p._id)}>Delete</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Portfolio;