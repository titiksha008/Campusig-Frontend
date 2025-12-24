//auth.context.js
// import { createContext, useContext, useState, useEffect } from "react";
// import api from "../services/api";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Check if already logged in (cookies / token)
//   useEffect(() => {
//     api.get("/auth/me")
//       .then(res => {
//         const loggedUser = res.data.user;
//         setUser(loggedUser);

//         // Persist userId in localStorage for page refresh
//         if (loggedUser?._id) {
//           localStorage.setItem("userId", loggedUser._id);
//         } else {
//           localStorage.removeItem("userId");
//         }
//       })
//       .catch(() => {
//         setUser(null);
//         localStorage.removeItem("userId");
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   // Optional: helper to update user and localStorage together
//   const updateUser = (newUser) => {
//     setUser(newUser);
//     if (newUser?._id) {
//       localStorage.setItem("userId", newUser._id);
//     } else {
//       localStorage.removeItem("userId");
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser: updateUser, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to get full user from localStorage on initial load
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync with backend to verify session / token
  useEffect(() => {
    api.get("/auth/me")
      .then(res => {
        const loggedUser = res.data.user;
        setUser(loggedUser);

        // Store full user for persistence
        if (loggedUser) {
          localStorage.setItem("user", JSON.stringify(loggedUser));
        } else {
          localStorage.removeItem("user");
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper to update context + localStorage together
  const updateUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}