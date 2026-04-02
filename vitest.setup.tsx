import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  };
});

vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: (props: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} alt={props.alt || "image"} />;
    }
  };
});
