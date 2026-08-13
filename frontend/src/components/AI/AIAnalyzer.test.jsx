import { render, screen, waitFor } from "@testing-library/react";
import AIAnalyzer from "./AIAnalyzer";
import api from "../../services/api";

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

let mockAppState = {
  token: null,
  role: "client",
  aiResult: null,
  photoUrl: null,
  bookingFirearm: null,
  workOrderDraft: null
};

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

jest.mock("../../state/AppState", () => ({
  useAppState: () => mockAppState,
  useAppDispatch: () => mockDispatch
}));

jest.mock("../Firearms/FirearmCard", () => {
  return function MockFirearmCard({ firearm }) {
    return <div data-testid="firearm-card">{firearm?.model || "mock firearm"}</div>;
  };
});

jest.mock("../../Pages/analyzer/AnalyzerAvatar", () => {
  return function MockAnalyzerAvatar({ statusText }) {
    return <div data-testid="analyzer-avatar">{statusText}</div>;
  };
});

jest.mock("../../Pages/analyzer/AnalyzerResults", () => {
  return function MockAnalyzerResults({ data }) {
    return <div data-testid="analyzer-results">{data ? "has-data" : "no-data"}</div>;
  };
});

jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn()
  },
  resolveAssetUrl: (url) => url
}));

describe("AIAnalyzer formatting and visibility", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDispatch.mockClear();
    api.get.mockResolvedValue({ data: [] });
    mockAppState = {
      token: null,
      role: "client",
      aiResult: null,
      photoUrl: null,
      bookingFirearm: null,
      workOrderDraft: null
    };
  });

  it("renders base formatter sections for unauthenticated state", () => {
    render(<AIAnalyzer />);

    expect(screen.getByText("AI Analyzer")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Upload Media" })).toBeTruthy();
    expect(screen.getByText("Select Firearm")).toBeTruthy();
    expect(screen.getByText("No firearm selected.")).toBeTruthy();
    expect(screen.getByText("No photo or video uploaded.")).toBeTruthy();
    expect(screen.getByPlaceholderText("Describe the firearm issue...")).toBeTruthy();
    expect(screen.getByText("Run AI Diagnostic")).toBeTruthy();
    expect(screen.getByTestId("analyzer-results").textContent).toBe("no-data");
  });

  it("shows gunsmith draft formatting block with expected values", async () => {
    mockAppState = {
      token: "token",
      role: "gunsmith",
      aiResult: {
        barrelWear: "Medium"
      },
      photoUrl: null,
      bookingFirearm: null,
      workOrderDraft: {
        progress: "in progress",
        estimatedTime: 2,
        partsNeeded: ["Spring", "Extractor"],
        notes: "Line one\nLine two"
      }
    };

    render(<AIAnalyzer />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    expect(screen.getByText("AI WorkOrder Auto‑Assist")).toBeTruthy();
    expect(screen.getByText("Create Work Order From Draft")).toBeTruthy();
    expect(screen.getByText("in progress", { exact: false })).toBeTruthy();
    expect(screen.getByText("2 hours", { exact: false })).toBeTruthy();
    expect(screen.getByText("Spring, Extractor", { exact: false })).toBeTruthy();
    const notesBlock = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === "pre" && content.includes("Line one") && content.includes("Line two");
    });
    expect(notesBlock).toBeTruthy();
  });
});
