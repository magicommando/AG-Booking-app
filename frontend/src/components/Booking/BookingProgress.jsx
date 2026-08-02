export default function BookingProgress({ currentStep, totalSteps = 4 }) {
  const safeStep = Math.min(Math.max(currentStep, 1), totalSteps);
  const percent = (safeStep / totalSteps) * 100;

  return (
    <div className="booking-progress" aria-label={`Booking progress: step ${safeStep} of ${totalSteps}`}>
      <div className="booking-progress-head">
        <span className="booking-step-label">Step {safeStep} of {totalSteps}</span>
        <span className="booking-progress-percent">{Math.round(percent)}%</span>
      </div>
      <div className="booking-progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={safeStep}>
        <div className="booking-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
