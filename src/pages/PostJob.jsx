//PostJobs.jsx

import { useState } from "react";
import axios from "axios"; // for fetching user
import api from "../services/api"; // axios instance (withCredentials: true)
import { FaPlus, FaTrash } from "react-icons/fa";
import "./AppStyles.css";

export default function PostJob({ setUser }) {
  // Job form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deadline: "",
  });

  // Skills state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add a skill to the list
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    setSkills([...skills, trimmed]);
    setNewSkill("");
  };

  // Remove skill by index
  const removeSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  // Fetch current logged-in user
  const fetchUser = async () => {
    const res = await axios.get("http://localhost:5000/api/auth/me", {
      withCredentials: true,
    });
    return res.data.user;
  };

  // Submit the job
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Post the job including skills
      await api.post("/jobs", { ...form, skills });

      alert("Job posted successfully!");

      // Reset form
      setForm({
        title: "",
        description: "",
        category: "",
        price: "",
        deadline: "",
      });
      setSkills([]);
      setNewSkill("");

      // Update user in Profile
      const updatedUser = await fetchUser();
      if (setUser) setUser(updatedUser);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("You must be logged in to post a job");
      } else {
        alert(err.response?.data?.error || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="post-job-container">
      <h2 className="post-job-title">Post a Job</h2>
      <form className="post-job-form" onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Category (e.g. Coding, Design)"
          value={form.category}
          onChange={handleChange}
          required
        />

        {/* Skills input */}
        <div className="form-group">
          <label>Required Skills</label>
          <div className="skills-edit">
            {skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill} <FaTrash className="skill-trash" onClick={() => removeSkill(idx)} />
              </span>
            ))}
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              className="skills-input"
            />
            <button type="button" onClick={addSkill} className="skills-add-btn">
              <FaPlus />
            </button>
          </div>
        </div>

        <input
          type="number"
          name="price"
          placeholder="Price (₹)"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          required
        />
        <button type="submit" className="post-job-btn">
          Post Job
        </button>
      </form>
    </div>
  );
}