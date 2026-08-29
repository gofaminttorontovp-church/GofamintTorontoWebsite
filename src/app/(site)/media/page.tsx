import type { Metadata } from "next";
import YoutubeGallery from "@/components/YoutubeGallery";
import PhotoGallery from "@/components/PhotoGallery";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Sermons, praise and ministrations from Gofamint Toronto, recorded in service and posted to our YouTube channel, and photographs of the life of the church.",
};

export default function MediaPage() {
  return (
    <>
      <YoutubeGallery />
      <PhotoGallery />
    </>
  );
}
