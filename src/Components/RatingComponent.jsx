// src/components/RatingComponent.jsx
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import api from "../services/api";
import "./RatingStyles.css";

export default function RatingComponent({ jobId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return alert("Please select a rating first!");
    try {
      await api.post(`/jobs/${jobId}/rate`, { rating, comment });
      setSubmitted(true);
      alert("Thanks for your feedback!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit rating. Try again.");
    }
  };

  if (submitted) {
    return (
      <div className="rating-success">
        <h4>Thank you for rating!</h4>
      </div>
    );
  }

  return (
    <div className="rating-container">
      <h3 className="rating-title">Rate This Work</h3>

      <div className="stars">
        {[...Array(5)].map((_, i) => {
          const ratingValue = i + 1;
          return (
            <FaStar
              key={i}
              className="star"
              size={30}
              color={ratingValue <= (hover || rating) ? "#facc15" : "#d1d5db"}
              onClick={() => setRating(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </div>

      <textarea
        className="rating-comment"
        placeholder="Write your feedback..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button className="rating-submit-btn" onClick={handleSubmit}>
        Submit Rating
      </button>
    </div>
  );
}
