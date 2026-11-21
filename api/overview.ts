import {
  publicEventsCatalog,
  publicLearningHighlights,
  publicPlatformStats,
} from '../src/data/fallbackCatalog';

export function GET(): Response {
  return new Response(
    JSON.stringify({
      stats: publicPlatformStats,
      learning: publicLearningHighlights,
      events: publicEventsCatalog,
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
