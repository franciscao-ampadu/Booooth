import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map · Boothmap",
};

export default function MapLayout({ children }: LayoutProps<"/map">) {
  return children;
}
