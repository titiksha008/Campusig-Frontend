// src/pages/PostJob.jsx
import { useState } from "react";
import axios from "axios";
import api from "../services/api";
import { FaPlus, FaTrash } from "react-icons/fa";
import "./AppStyles.css";

export default function PostJob({ setUser }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deadline: "",
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    setSkills([...skills, trimmed]);
    setNewSkill("");
  };

  const removeSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const fetchUser = async () => {
    const res = await axios.get("http://localhost:5000/api/auth/me", {
      withCredentials: true,
    });
    return res.data.user;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/jobs", { ...form, skills });
      alert("Job posted successfully!");
      setForm({
        title: "",
        description: "",
        category: "",
        price: "",
        deadline: "",
      });
      setSkills([]);
      setNewSkill("");
      const updatedUser = await fetchUser();
      if (setUser) setUser(updatedUser);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("You must be logged in to post a job");
      } else {
        alert(
          err.response?.data?.error || "Something went wrong. Please try again."
        );
      }
    }
  };

  return (
    <div className="post-job-container">
      <h2 className="post-job-title">Post a Job</h2>
      <form className="post-job-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Job Title</label>
          <input
            name="title"
            placeholder="Enter job title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Job Description</label>
          <textarea
            name="description"
            placeholder="Describe the job requirements"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Category</label>
          <input
            name="category"
            placeholder="e.g. Coding, Design"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div>

        {/* Skills Input */}
        <div className="form-field">
          <label>Required Skills</label>
          <div className="skills-edit">
            {skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
                <FaTrash
                  className="skill-trash"
                  onClick={() => removeSkill(idx)}
                />
              </span>
            ))}
          </div>

          <div className="skills-input-wrapper">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              className="skills-input"
            />
            <button
              type="button"
              onClick={addSkill}
              className="skills-add-btn"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Price (₹)</label>
            <input
              type="number"
              name="price"
              placeholder="Enter price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="post-job-btn">
          Post Job
        </button>
      </form>
    </div>
  );
}
