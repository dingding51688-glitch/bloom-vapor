import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCollectionGrid } from "../ProductCollectionGrid";
import type { ProductCardData } from "@/lib/types";

const sampleProducts: ProductCardData[] = [
  {
    id: "sample-1",
    title: "Daybreak Flower",
    category: "Flower",
    description: "Citrus uplift",
    price: "£35"
  },
  {
    id: "sample-2",
    title: "Midnight Cart",
    category: "Vape",
    price: "£42"
  }
];

describe("ProductCollectionGrid", () => {
  it("renders supplied products", () => {
    render(<ProductCollectionGrid title="Menu" products={sampleProducts} />);

    expect(screen.getByText(/daybreak flower/i)).toBeInTheDocument();
    expect(screen.getByText(/midnight cart/i)).toBeInTheDocument();
  });

  it("shows fallback when list empty", () => {
    render(<ProductCollectionGrid title="Menu" products={[]} />);

    expect(
      screen.getByText(/no products available — check back after the next drop/i)
    ).toBeInTheDocument();
  });
});
