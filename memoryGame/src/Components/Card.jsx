import React, { useEffect, useRef, useState } from "react";
import "./Card.css";

function sanitizeUrl(url) {
  if (!url) return url;
  const s = String(url).trim();
  if (s.startsWith("//")) return "https:" + s;
  if (s.startsWith("http:")) return s.replace(/^http:/, "https:");
  return s;
}

function Card({ item, toggled, stopflip, handleSelectedCards }) {
  const PLACEHOLDER_IMG =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  const [imgSrc, setImgSrc] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const hideTimerRef = useRef(null);
  const showTimerRef = useRef(null);

  const ANIM_DURATION = 350;
  const FLIP_DELAY = 20; // small delay to trigger transition

  useEffect(() => {
    if (toggled || item?.matched) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      const src = sanitizeUrl(item?.img) || PLACEHOLDER_IMG;
      setImgSrc(src);

      // tiny delay ensures CSS transition triggers
      showTimerRef.current = setTimeout(() => {
        setIsFlipped(true);
        showTimerRef.current = null;
      }, FLIP_DELAY);
    } else {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      setIsFlipped(false);

      if (imgSrc) {
        hideTimerRef.current = setTimeout(() => {
          setImgSrc(null);
          hideTimerRef.current = null;
        }, ANIM_DURATION + 50);
      }
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [toggled, item?.matched, item?.img]);

  return (
    <div className={`item ${isFlipped ? "toggled" : ""}`}>
      {imgSrc ? (
        <img
          className="face"
          src={imgSrc}
          alt={item?.name || ""}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
      ) : (
        <div className="face" aria-hidden="true" />
      )}

      <div
        className="back"
        onClick={() =>
          !stopflip &&
          !isFlipped &&
          !item?.matched &&
          handleSelectedCards(item)
        }
      />
    </div>
  );
}

export default Card;
