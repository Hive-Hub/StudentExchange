import { publicWorkshopCompetitions } from '../src/data/fallbackCatalog';

export function GET(request: Request): Response {
  const url = new URL(request.url);
  const type = (url.searchParams.get('type') || '').trim();
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();

  const items = publicWorkshopCompetitions.filter((item) => {
    const matchesType = !type || type === 'All' || item.type === type;
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.organizer.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
