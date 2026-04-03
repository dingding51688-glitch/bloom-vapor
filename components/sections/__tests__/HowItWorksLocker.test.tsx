import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HowItWorksLocker } from "../HowItWorksLocker";

describe("HowItWorksLocker", () => {
  it("renders steps and tip copy", () => {
    render(
      <HowItWorksLocker
        title="Locker flow"
        steps={[
          { icon: "①", title: "Reserve", description: "Lock your slot" },
          { icon: "②", title: "Pack", description: "Team prepares" }
        ]}
        tip={{ label: "Members", content: "Open 24/7" }}
      />
    );

    expect(screen.getByText(/locker flow/i)).toBeInTheDocument();
    expect(screen.getByText(/reserve/i)).toBeInTheDocument();
    expect(screen.getAllByText(/open 24\/7/i)).toHaveLength(2);
  });
});
