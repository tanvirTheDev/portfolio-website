import StudioPageClient from "./StudioPageClient";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <StudioPageClient />;
}
