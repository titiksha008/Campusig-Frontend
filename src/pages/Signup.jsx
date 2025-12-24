// //Signup.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";
// import "./AppStyles.css";

// export default function Signup() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "freelancer",
//     collegeId: "",
//   });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const { data } = await api.post("/auth/signup", form);
//       // Auto-login: store token if backend returns it, or redirect to login
//       // If backend doesn't return token, keep current navigate("/login")
//       navigate("/login");
//     } catch (err) {
//       setError(err.response?.data?.message || "Signup failed");
//     }
//   };


//   return (
//     <div className="page-container">
//       <h2>Signup</h2>
//       {error && <p className="error-message">{error}</p>}
//       <form onSubmit={handleSubmit} className="form">
//         <input
//           name="name"
//           placeholder="Name"
//           value={form.name}
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="collegeId"
//           placeholder="College ID"
//           value={form.collegeId}
//           onChange={handleChange}
//           required
//         />
//         <select name="role" value={form.role} onChange={handleChange}>
//           <option value="freelancer">Freelancer</option>
//           <option value="employer">Employer</option>
//         </select>
//         <button type="submit">Signup</button>
//       </form>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AppStyles.css";
import { useAuth } from "../context/AuthContext"; // ✅

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // ✅
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "freelancer", collegeId: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/signup", form);
      setUser(data.user); // ✅ directly login after signup
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="page-container">
      <h2>Signup</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input name="collegeId" placeholder="College ID" value={form.collegeId} onChange={handleChange} required />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="freelancer">Freelancer</option>
          <option value="employer">Employer</option>
        </select>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}