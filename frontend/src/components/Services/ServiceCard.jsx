import "./ServiceCard.css";

export default function ServiceCard({ service, onSelect }) {
  return (
    <div className="servicecard" onClick={() => onSelect(service)}>
      <h3 className="servicecard-title">{service.name}</h3>

      {service.description && (
        <p className="servicecard-desc">{service.description}</p>
      )}

      {service.price && (
        <p className="servicecard-price">${service.price}</p>
      )}
    </div>
  );
}
