import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import Dashboard from "@/components/Dashboard";

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const agg = await getAggregation();
  const { locale: loc, t } = getDict(locale);
  return (
    <main>
      <Dashboard base={agg} home={t.home} kinds={t.kinds} locale={loc} />
    </main>
  );
}
