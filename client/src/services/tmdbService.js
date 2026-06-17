/* eslint-disable no-unused-vars */
// client/src/services/tmdbService.js
// Fetches movie poster + backdrop images from TMDB API
// Make sure your .env file has: REACT_APP_TMDB_KEY=your_api_key_here
console.log('TMDB KEY:', process.env.REACT_APP_TMDB_KEY);
const TMDB_API_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// ── Image size options ────────────────────────────────────
// Poster:   w300 (card), w500 (medium), w780 (large)
// Backdrop: w780 (small), w1280 (hero banner), original
const POSTER_SIZE   = 'w500';
const BACKDROP_SIZE = 'w1280';

/**
 * fetchMovieImages(title, releaseYear?)
 * Searches TMDB for a movie and returns its poster + backdrop URLs.
 *
 * @param {string} title        - movie.title from your DB
 * @param {number} releaseYear  - movie.release_year from your DB (optional, improves accuracy)
 * @returns {{ posterUrl: string|null, backdropUrl: string|null }}
 */
export async function fetchMovieImages(title, releaseYear = null) {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key missing. Add REACT_APP_TMDB_KEY to your .env file.');
    return { posterUrl: null, backdropUrl: null };
  }

  try {
    const query     = encodeURIComponent(title);
    const yearParam = releaseYear ? `&year=${releaseYear}` : '';
    const url       = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}${yearParam}`;

    const res  = await fetch(url);
    if (!res.ok) throw new Error(`TMDB responded with status ${res.status}`);

    const data   = await res.json();
    const result = data.results?.[0];

    if (!result) return { posterUrl: null, backdropUrl: null };

    return {
      posterUrl:   result.poster_path   ? `${TMDB_IMAGE_BASE}/${POSTER_SIZE}${result.poster_path}`     : null,
      backdropUrl: result.backdrop_path ? `${TMDB_IMAGE_BASE}/${BACKDROP_SIZE}${result.backdrop_path}` : null,
    };
  } catch (err) {
    console.error(`[TMDB] Failed to fetch images for "${title}":`, err.message);
    return { posterUrl: null, backdropUrl: null };
  }
}