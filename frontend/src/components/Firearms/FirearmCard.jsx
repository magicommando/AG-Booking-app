import "./FirearmCard.css";

export default function FirearmCard({ firearm, onSelect, showActions = true }) {
  const { make, model, serial, type, caliber, _id } = firearm;

  return (
    <div className="firearmcard" onClick={() => onSelect && onSelect(firearm)}>
      <h3 className="firearmcard-title">
        {make} {model}
      </h3>

      <div className="firearmcard-body">
        {type && <p><strong>Type:</strong> {type}</p>}
        {caliber && <p><strong>Caliber:</strong> {caliber}</p>}
        {serial && <p><strong>Serial:</strong> {serial}</p>}
      </div>

      {showActions && (
        <div className="firearmcard-actions">
          <button
            className="firearmcard-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(firearm);
            }}
          >
            Select
          </button>
        </div>
      )}
    </div>
  );
}
