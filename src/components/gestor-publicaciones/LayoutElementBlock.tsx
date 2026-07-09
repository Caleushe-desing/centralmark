import type { LayoutElement } from "@/lib/pro-ad/schemas";
import { buildLayoutElementStyle, hasElementBackground } from "@/lib/pro-ad/layout-styles";

interface LayoutElementBlockProps {
  element: LayoutElement;
}

const ALIGN_SELF: Record<LayoutElement["textAlign"], string> = {
  left: "self-start",
  center: "self-center",
  right: "self-end",
};

export function LayoutElementBlock({ element }: LayoutElementBlockProps) {
  const hasBackground = hasElementBackground(element);

  return (
    <div
      className={[
        "w-fit max-w-[92%]",
        ALIGN_SELF[element.textAlign],
        !hasBackground ? "rounded-xl px-4 py-2 bg-black/35 backdrop-blur-sm" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        style={buildLayoutElementStyle(element)}
        data-layout-id={element.id}
        className={!hasBackground ? "drop-shadow-2xl" : ""}
      >
        {element.text}
      </div>
    </div>
  );
}
