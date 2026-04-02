import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PaymentRecommendation } from "../PaymentRecommendation";

describe("PaymentRecommendation", () => {
  it("shows recommendation and secondary plans", () => {
    render(
      <PaymentRecommendation
        recommendation={{
          title: "Reserve+",
          description: "Locker allocation",
          price: "£49",
          frequency: "/ month",
          badge: "Popular",
          features: ["Hold locker"],
          cta: { label: "Start", href: "/reserve" }
        }}
        secondary={[
          {
            title: "Pay as you go",
            description: "Book when you need",
            price: "£0",
            frequency: "/ booking",
            features: ["Standard access"],
            cta: { label: "Menu", href: "/" }
          }
        ]}
        footnote="Switch anytime"
      />
    );

    expect(screen.getByText(/reserve\+/i)).toBeInTheDocument();
    expect(screen.getByText(/pay as you go/i)).toBeInTheDocument();
    expect(screen.getByText(/switch anytime/i)).toBeInTheDocument();
  });
});
