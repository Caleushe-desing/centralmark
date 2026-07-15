import type { Metadata } from "next";
import { DemoSandbox } from "@/components/demo/DemoSandbox";

export const metadata: Metadata = {
  title: "Demo interactiva · CentralMark",
  description:
    "Prueba el flujo de publicaciones y moderación de CentralMark sin IA ni costos.",
};

export default function DemoPage() {
  return <DemoSandbox />;
}
