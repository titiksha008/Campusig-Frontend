//ProfilePicSelector.jsx
import React, { useState } from "react";
import Lottie from "lottie-react";

// Import animated avatars
import avatar1 from "../assets/avatars/avatar1.json";
import avatar2 from "../assets/avatars/avatar2.json";
import avatar3 from "../assets/avatars/avatar3.json";
import avatar4 from "../assets/avatars/avatar4.json";
import avatar5 from "../assets/avatars/avatar5.json";
import avatar6 from "../assets/avatars/avatar6.json";
import avatar7 from "../assets/avatars/avatar7.json";
import avatar8 from "../assets/avatars/avatar8.json";

// Map avatar IDs to Lottie JSON
export const avatarsMap = {
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
};

// Array of IDs to display
const avatarsIDs = Object.keys(avatarsMap);

const ProfilePicSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (id, index) => {
    setSelected(index);
    onSelect(id); // ✅ send string ID instead of full JSON
  };

  return (
    <div className="avatar-grid">
      {avatarsIDs.map((id, i) => (
        <div
          key={i}
          onClick={() => handleSelect(id, i)}
          className={`avatar-card ${selected === i ? "selected" : ""}`}
        >
          <Lottie animationData={avatarsMap[id]} loop={true} style={{ height: 80 }} />
        </div>
      ))}
    </div>
  );
};

export default ProfilePicSelector;