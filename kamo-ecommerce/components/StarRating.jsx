"use client";

import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const StarRating = ({ rating, onRatingChange, size = 24 }) => {
  const [hover, setHover] = useState(null);
  const isInteractive = !!onRatingChange;

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index}>
            {isInteractive && (
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => onRatingChange(ratingValue)}
                className="hidden"
              />
            )}
            <FaStar
              className={`cursor-${isInteractive ? "pointer" : "default"}`}
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              size={size}
              onMouseEnter={isInteractive ? () => setHover(ratingValue) : null}
              onMouseLeave={isInteractive ? () => setHover(null) : null}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;

