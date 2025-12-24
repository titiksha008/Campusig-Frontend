// import { Link, useNavigate } from "react-router-dom";
// import { FaComments } from "react-icons/fa";
// import "./AppStyles.css";
// import api from "../services/api";
// import { useAuth } from "../context/AuthContext";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const { user, setUser, loading } = useAuth();

//   const handleLogout = async () => {
//     try {
//       await api.post("/auth/logout");
//     } catch (err) {
//       console.error(err);
//     }
//     setUser(null);
//     navigate("/login");
//   };

//   if (loading) return null; // wait for auth check
//   const loggedIn = !!user;

//   return (
//     <nav className="navbar">
//       <div className="nav-left">
//         <Link to="/" className="logo">CampusGig</Link>
//       </div>

//       <div className="nav-center">
//         {loggedIn && user?.role === "admin" ? (
//           <>
//             <Link to="/admin/dashboard">Dashboard</Link>
//             <Link to="/admin/users">View All Users</Link>
//             <Link to="/admin/jobs">View All Jobs</Link>
//           </>
//         ) : (
//           <>
//             <Link to="/jobs">Jobs</Link>
//             <Link to="/post-job">Post Job</Link>
//             {loggedIn && <Link to="/accepted-jobs">Accepted Jobs</Link>}
//             {loggedIn && <Link to="/my-jobs">My Jobs</Link>}
//           </>
//         )}
//       </div>

//       <div className="nav-right">
//         {loggedIn && user?.role !== "admin" && (
//           <Link to="/chat" className="chat-icon-link" title="Chat">
//             <FaComments size={30} />
//           </Link>
//         )}

//         {loggedIn ? (
//           <div className="profile-dropdown">
//             <span className="profile-text">Profile ▾</span>
//             <div className="dropdown-content">
//               {user?.role !== "admin" && (
//                 <>
//                   <Link to="/profile">View Profile</Link>
//                   {user?._id && <Link to={`/portfolio/${user._id}`}>Portfolio</Link>}
//                   <Link to="/mybids">My Bids / Earnings</Link>
//                   <Link to="/saved-jobs">Saved Jobs</Link>
//                 </>
//               )}
//               <button onClick={handleLogout} className="logout-btn">Logout</button>
//             </div>
//           </div>
//         ) : (
//           <>
//             <Link to="/login" className="nav-btn">Login</Link>
//             <Link to="/signup" className="nav-btn signup-btn">Signup</Link>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// }


import { Link, useNavigate } from "react-router-dom";
import { FaComments, FaClipboardList , FaRegNewspaper } from "react-icons/fa6";
import "./AppStyles.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    navigate("/login");
  };

  if (loading) return null;

  const loggedIn = !!user;

  return (
    <nav className="navbar">
      {/* LEFT SIDE */}
      <div className="nav-left">
        <Link to="/" className="logo">CampusGig</Link>
      </div>

      {/* CENTER LINKS */}
      <div className="nav-center">
        {loggedIn && user?.role === "admin" ? (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/users">View All Users</Link>
            <Link to="/admin/jobs">View All Jobs</Link>
          </>
        ) : (
          <>
            <Link to="/jobs">Jobs</Link>
            <Link to="/post-job">Post Job</Link>
            {loggedIn && <Link to="/accepted-jobs">Accepted Jobs</Link>}
            {loggedIn && <Link to="/my-jobs">My Jobs</Link>}
            {loggedIn && (
              <Link to="/discussion" className="nav-link-discussion">
                {/* <FaClipboardList size={18} className="mr-1" /> */}
                Discussion
              </Link>
            )}
            {loggedIn && (
              <Link to="/news" className="nav-link-discussion">
                News
              </Link>
            )}
            {/* Add this link for posting news */}
      {loggedIn && (
        <Link to="/post-news" className="nav-link-discussion">
          Post News
        </Link>
      )}
          </>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">

        {/* CHAT ICON FOR NORMAL USERS ONLY */}
        {loggedIn && user?.role !== "admin" && (
          <Link to="/chat" className="chat-icon-link" title="Chat">
            <FaComments size={30} />
          </Link>
        )}

        {/* AUTH OPTIONS */}
        {loggedIn ? (
          user?.role === "admin" ? (
            // ADMIN sees only LOGOUT
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "transparent",
                  color: "black",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Logout
              </button>

          ) : (
            // NORMAL USER PROFILE DROPDOWN
            <div className="profile-dropdown">
              <span className="profile-text">Profile ▾</span>
              <div className="dropdown-content">
                <Link to="/profile">View Profile</Link>
                {user?._id && <Link to={`/portfolio/${user._id}`}>Portfolio</Link>}
                <Link to="/mybids">My Bids / Earnings</Link>
                <Link to="/saved-jobs">Saved Jobs</Link>

                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            <Link to="/login" className="nav-btn">Login</Link>
            <Link to="/signup" className="nav-btn signup-btn">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}