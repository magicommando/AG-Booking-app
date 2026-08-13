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

  it("renders array-based AI diagnostics and recommendations without losing detail", () => {
    const payload = {
      diagnostics: [
        "Possible failure to eject or feed.",
        "Chamber may have visible fouling."
      ],
      recommendations: [
        "Inspect extractor and clean chamber.",
        "Verify magazine alignment before testing."
      ],
      warnings: ["Extractor spring may be worn."],
      barrelWear: "Medium",
      recommendedService: "Extractor service and chamber clean"
    };

    render(<AnalyzerResults data={payload} />);

    expect(screen.getAllByText("Possible failure to eject or feed.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Inspect extractor and clean chamber.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Extractor spring may be worn.").length).toBeGreaterThan(0);
    expect(screen.getByText(/Barrel Wear:/)).toBeTruthy();
  });
});
