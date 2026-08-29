import type { Metadata } from "next";
import YoutubeGallery from "@/components/YoutubeGallery";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Sermons, praise and ministrations from Gofamint Toronto, recorded in service and posted to our YouTube channel.",
};

export default function MediaPage() {
  return <YoutubeGallery />;
}
