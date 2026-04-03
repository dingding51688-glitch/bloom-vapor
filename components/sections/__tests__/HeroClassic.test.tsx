import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HeroClassic } from "../HeroClassic";

describe("HeroClassic", () => {
  it("renders title, subtitle and CTAs", () => {
    render(
      <HeroClassic
        title="Locker hero"
        subtitle="Trusted lockers across Belfast"
        primaryCta={{ label: "Shop lockers", href: "/" }}
        secondaryCta={{ label: "Learn more", href: "/how-it-works" }}
      />
    );

    expect(screen.getByText(/locker hero/i)).toBeInTheDocument();
    expect(screen.getByText(/trusted lockers/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop lockers/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /learn more/i })).toBeInTheDocument();
  });
});
