import { RoadTrip } from "@/components/road-trip";
import { DestinationStrip, FleetShowcase, RoutesTeaser } from "@/components/home";
import { Cta } from "@/components/cta";
import { getContent } from "@/lib/content";

export default async function Home() {
  const { pages } = await getContent();
  return (
    <>
      <RoadTrip />
      <FleetShowcase />
      <RoutesTeaser />
      <DestinationStrip />
      <Cta image={pages.home.cta} />
    </>
  );
}
