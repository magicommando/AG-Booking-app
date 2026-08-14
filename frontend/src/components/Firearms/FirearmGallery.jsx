import { useMemo, useRef, useState } from "react";

export default function FirearmGallery({
  photos = [],
  originalPhotos = [],
  make = "Unknown",
  model = "Model",
  onRemovePhoto,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const stripRef = useRef(null);

  const safePhotos = useMemo(
    () => Array.isArray(photos) ? photos.filter(Boolean) : [],
    [photos]
  );

  const safeOriginalPhotos = useMemo(
    () => Array.isArray(originalPhotos) ? originalPhotos.filter(Boolean) : [],
    [originalPhotos]
  );

  if (!safePhotos.length) {
    return <div className="firearm-details-no-photo">No uploaded photos for this firearm.</div>;
  }

  const selectedPhoto = safePhotos[selectedIndex] || safePhotos[0];

  const handleStripDrag = (event) => {
    if (!stripRef.current) return;
    stripRef.current.scrollLeft += event.deltaY * 0.8;
  };

  return (
    <div className="firearm-gallery">
      <div className="firearm-gallery-main">
        <button
          type="button"
          className="firearm-gallery-main-button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Open image ${selectedIndex + 1} in fullscreen`}
        >
          <img
            src={selectedPhoto}
            alt={`${make} ${model}`}
            className="firearm-details-image"
          />
        </button>

        {typeof onRemovePhoto === "function" && (
          <button
            type="button"
            className="firearm-details-remove-btn firearm-details-remove-primary"
            title="Remove this photo"
            onClick={() => onRemovePhoto(safeOriginalPhotos[selectedIndex] ?? safeOriginalPhotos[0] ?? selectedPhoto)}
          >
            <span aria-hidden="true">✕</span>
            <span>Remove</span>
          </button>
        )}
      </div>

      {safePhotos.length > 1 && (
        <div
          ref={stripRef}
          className="firearm-gallery-strip"
          role="list"
          aria-label="Firearm gallery thumbnails"
          onWheel={handleStripDrag}
        >
          {safePhotos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              className={`firearm-gallery-thumb-button ${selectedIndex === index ? "is-selected" : ""}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={photo}
                alt={`${make} ${model} view ${index + 1}`}
                className="firearm-details-thumb"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="firearm-gallery-lightbox" onClick={() => setLightboxOpen(false)} role="dialog" aria-modal="true">
          <button
            type="button"
            className="firearm-gallery-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close fullscreen image"
          >
            ×
          </button>
          <img src={selectedPhoto} alt={`${make} ${model}`} className="firearm-gallery-lightbox-image" />
        </div>
      )}
    </div>
  );
}
