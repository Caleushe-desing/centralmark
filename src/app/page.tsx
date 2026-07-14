import { CentralMarkLanding } from "@/components/landing/CentralMarkLanding";
import { getLandingContentMap } from "@/lib/cms/site-cms";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getLandingContentMap();
  return <CentralMarkLanding content={content} />;
}
