// ai/aiEngine.js

module.exports = {
  analyzeFirearmIssue(inputText, photoUrl) {
    // Basic rule-based diagnostics (placeholder until real AI is added)
    let diagnostics = [];
    let recommendations = [];
    let parts = [];
    let laborTime = 1.0;

    const text = inputText.toLowerCase();

    if (text.includes("jam") || text.includes("stovepipe")) {
      diagnostics.push("Possible failure to eject or feed.");
      recommendations.push("Inspect extractor, clean chamber, check magazine.");
      parts.push("Extractor spring");
      laborTime = 1.5;
    }

    if (text.includes("misfire") || text.includes("light strike")) {
      diagnostics.push("Possible firing pin or primer ignition issue.");
      recommendations.push("Inspect firing pin channel, clean bolt, check ammo.");
      parts.push("Firing pin");
      laborTime = 2.0;
    }

    if (text.includes("rust") || text.includes("corrosion")) {
      diagnostics.push("Surface corrosion detected.");
      recommendations.push("Perform rust removal, apply protective oil.");
      laborTime = 1.0;
    }

    if (diagnostics.length === 0) {
      diagnostics.push("No specific issue detected from description.");
      recommendations.push("Perform general inspection and cleaning.");
    }

    return {
      diagnostics,
      recommendations,
      parts,
      laborTime,
      photoUrl
    };
  },

  analyzeInventoryItem(item) {
    let alert = false;
    let recommendation = null;

    if (item.quantity <= 2) {
      alert = true;
      recommendation = `Reorder ${item.productName}. Only ${item.quantity} left.`;
    }

    return {
      alert,
      recommendation
    };
  }
};
