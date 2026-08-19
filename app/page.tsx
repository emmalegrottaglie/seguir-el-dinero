import { getAggregation } from "@/lib/data";
import Dashboard from "@/components/Dashboard";

// Re-read the snapshot on each request in dev; ISR-cached in prod.
export const revalidate = 3600;

export default async function HomePage() {
  const agg = await getAggregation();
  return (
    <main>
      <Dashboard base={agg} />
    </main>
  );
}
