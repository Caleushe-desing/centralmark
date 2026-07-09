import type { LayoutElement } from "@/lib/pro-ad/schemas";
import { buildLayoutElementStyle } from "@/lib/pro-ad/layout-styles";

interface LayoutElementBlockProps {
  element: LayoutElement;
}

export function LayoutElementBlock({ element }: LayoutElementBlockProps) {
  return (
    <div style={buildLayoutElementStyle(element)} data-layout-id={element.id}>
      {element.text}
    </div>
  );
}
