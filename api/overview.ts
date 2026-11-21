import {
  publicEventsCatalog,
  publicLearningHighlights,
  publicPlatformStats,
  publicWorkshopCompetitions,
} from '../src/data/fallbackCatalog';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
};

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export function GET(): Response {
  return new Response(
    JSON.stringify({
      stats: publicPlatformStats,
      learning: publicLearningHighlights,
      events: publicEventsCatalog,
      workshops: publicWorkshopCompetitions,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
