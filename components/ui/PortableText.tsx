import { PortableText as SanityPortableText } from "@portabletext/react";
import type { PortableTextBlock } from "sanity";

interface Props {
  value: PortableTextBlock[];
  className?: string;
}

/**
 * Thin wrapper around @portabletext/react.
 * Renders only the block types we use: normal paragraphs, headers, lists.
 */
export default function PortableText({ value, className }: Props) {
  if (!value?.length) return null;
  return (
    <div className={className}>
      <SanityPortableText value={value} />
    </div>
  );
}
