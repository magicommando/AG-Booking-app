import "./FirearmCard.css";

export default function FirearmCard({ firearm, onSelect, showActions = true, selected = false, buttonLabel = "Select", showClientInfo = false }) {
  const make = firearm.make || firearm.manufacturer;
  const model = firearm.model;
  const serial = firearm.serial || firearm.serialNumber;
  const type = firearm.type;
  const caliber = firearm.caliber;
  const owner = firearm.userId;
  const clientName = typeof owner === "object"
    ? [owner.firstName, owner.lastName].filter(Boolean).join(" ")
      || owner.fullName
      || owner.name
      || owner.email
      || "Unknown"
    : null;
  const clientId = typeof owner === "object" ? owner._id : owner;

  return (
    <div className={`firearmcard${selected ? " is-selected" : ""}`} onClick={() => onSelect && onSelect(firearm)}>
      <h3 className="firearmcard-title">
        {make} {model}
      </h3>

      <div className="firearmcard-body">
        {type && <p><strong>Type:</strong> {type}</p>}
        {caliber && <p><strong>Caliber:</strong> {caliber}</p>}
        {serial && <p><strong>Serial:</strong> {serial}</p>}
        {showClientInfo && clientName && <p><strong>Client:</strong> {clientName}</p>}
        {showClientInfo && clientId && <p><strong>Client ID:</strong> {clientId}</p>}
      </div>

      {showActions && (
        <div className="firearmcard-actions">
          <button
            className="firearmcard-btn"
            disabled={selected}
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(firearm);
            }}
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}
