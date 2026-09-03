import { Hero } from "@/components/home/hero";
import { SearchTools } from "@/components/home/search-tools";
import { PopularTools } from "@/components/home/popular-tools";
import { RecentlyAdded } from "@/components/home/recently-added";
import { SuggestTool } from "@/components/home/suggest-tool";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SearchTools />
      <PopularTools />
      <RecentlyAdded />
      <SuggestTool />
    </>
  );
}
