const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*"
    }
  });

const errorResponse = (message, status = 500) =>
  json({ ok: false, error: message }, status);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API
    if (url.pathname === "/api/health") {
      try {
        const result = await env.DB.prepare("SELECT 1 AS ok").first();
        return json({
          ok: true,
          database: result?.ok === 1,
          service: "mynba-api"
        });
      } catch (error) {
        return errorResponse(String(error));
      }
    }

    if (url.pathname === "/api/teams" && request.method === "GET") {
      try {
        const result = await env.DB.prepare(`
          SELECT id, abbreviation, name, city, conference, division,
                 wins, losses, logo_url
          FROM teams
          ORDER BY conference, division, city, name
        `).all();

        return json({
          ok: true,
          count: result.results.length,
          teams: result.results
        });
      } catch (error) {
        return errorResponse(String(error));
      }
    }

    if (url.pathname === "/api/players" && request.method === "GET") {
      try {
        const limit = Math.min(
          Math.max(Number(url.searchParams.get("limit") || 100), 1),
          500
        );

        const search = (url.searchParams.get("search") || "").trim();

        let result;
        if (search) {
          result = await env.DB.prepare(`
            SELECT id, first_name, last_name, display_name, country,
                   position, height_cm, weight_kg, dominant_hand, college,
                   overall, potential, archetype, photo_url,
                   is_created_player, is_rookie
            FROM players
            WHERE display_name LIKE ?
               OR first_name LIKE ?
               OR last_name LIKE ?
            ORDER BY overall DESC, display_name ASC
            LIMIT ?
          `).bind(`%${search}%`, `%${search}%`, `%${search}%`, limit).all();
        } else {
          result = await env.DB.prepare(`
            SELECT id, first_name, last_name, display_name, country,
                   position, height_cm, weight_kg, dominant_hand, college,
                   overall, potential, archetype, photo_url,
                   is_created_player, is_rookie
            FROM players
            ORDER BY overall DESC, display_name ASC
            LIMIT ?
          `).bind(limit).all();
        }

        return json({
          ok: true,
          count: result.results.length,
          players: result.results
        });
      } catch (error) {
        return errorResponse(String(error));
      }
    }

    if (url.pathname === "/api/standings" && request.method === "GET") {
      try {
        const seasonId = url.searchParams.get("season_id");

        let result;
        if (seasonId) {
          result = await env.DB.prepare(`
            SELECT s.id, s.season_id, s.team_id, s.conference,
                   s.wins, s.losses, s.win_percentage,
                   s.games_behind, s.streak,
                   s.last_ten_wins, s.last_ten_losses,
                   t.abbreviation, t.name, t.city
            FROM standings s
            JOIN teams t ON t.id = s.team_id
            WHERE s.season_id = ?
            ORDER BY s.conference, s.wins DESC, s.losses ASC, t.name ASC
          `).bind(seasonId).all();
        } else {
          result = await env.DB.prepare(`
            SELECT s.id, s.season_id, s.team_id, s.conference,
                   s.wins, s.losses, s.win_percentage,
                   s.games_behind, s.streak,
                   s.last_ten_wins, s.last_ten_losses,
                   t.abbreviation, t.name, t.city
            FROM standings s
            JOIN teams t ON t.id = s.team_id
            ORDER BY s.season_id DESC,
                     s.conference, s.wins DESC, s.losses ASC, t.name ASC
          `).all();
        }

        return json({
          ok: true,
          count: result.results.length,
          standings: result.results
        });
      } catch (error) {
        return errorResponse(String(error));
      }
    }

    // Everything that is not an API request is the MYNBA frontend.
    try {
      return env.ASSETS.fetch(request);
    } catch (error) {
      return errorResponse(String(error));
    }
  }
};
