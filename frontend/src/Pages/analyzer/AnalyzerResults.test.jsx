import { render, screen } from "@testing-library/react";
import AnalyzerResults from "./AnalyzerResults";

describe("AnalyzerResults formatting", () => {
  it("shows fallback when no data is provided", () => {
    render(<AnalyzerResults data={null} />);

    expect(screen.getByText("No diagnostic results yet.")).toBeTruthy();
  });

  it("renders structured diagnostic fields with warnings", () => {
    const payload = {
      barrelWear: "Low",
      roundCountEstimate: 1800,
      recommendedService: "Deep clean and inspection",
      warnings: ["Extractor wear detected", "Check chamber for pitting"]
    };

    render(<AnalyzerResults data={payload} />);

    expect(screen.getByText("Diagnostic Report")).toBeTruthy();
    expect(screen.getByText(/Barrel Wear:/)).toBeTruthy();
    expect(screen.getByText(/Round Count Estimate:/)).toBeTruthy();
    expect(screen.getByText(/Recommended Service:/)).toBeTruthy();
    expect(screen.getByText("Extractor wear detected")).toBeTruthy();
    expect(screen.getByText("Check chamber for pitting")).toBeTruthy();
  });

  it("renders raw payload with preserved line breaks", () => {
    const payload = {
      notes: "Line one\nLine two",
      nested: { ok: true }
    };

    render(<AnalyzerResults data={payload} />);

    const jsonBlock = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === "pre" && content.includes('"notes": "Line one\\nLine two"');
    });

    expect(jsonBlock).toBeTruthy();
  });
});
