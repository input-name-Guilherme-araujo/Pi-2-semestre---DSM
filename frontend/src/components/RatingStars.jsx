"use client"

import { useState } from "react"
import { Star } from "lucide-react"

export const RatingStars = ({ rating = 0, onRatingChange, readonly = false, size = "default" }) => {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-5 w-5",
    large: "h-6 w-6",
  }

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hoverRating || rating) >= star
        return (
          <Star
            key={star}
            className={`rating-star ${sizeClasses[size]} ${
              filled ? "filled" : "empty"
            } ${!readonly ? "cursor-pointer" : ""}`}
            fill={filled ? "currentColor" : "none"}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
          />
        )
      })}
    </div>
  )
}
