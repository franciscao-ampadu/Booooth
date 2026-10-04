import type { Metadata } from "next";
import EnterBooth from "@/components/sketch/EnterBooth";

export const metadata: Metadata = {
  title: "Welcome · Boothmap",
};

export default function EnterPage() {
  return <EnterBooth />;
}
