// client/src/hooks/useMovieImages.js
// Custom hook — drop this in any component to get poster + backdrop for a movie.

import { useState, useEffect } from 'react';
import { fetchMovieImages } from '../services/tmdbService';

/**
 * useMovieImages(title, releaseYear?)
 *
 * Usage:
 *   const { posterUrl, backdropUrl, loading } = useMovieImages(movie.title, movie.release_year);
 *
 * @param {string} title       - movie.title
 * @param {number} releaseYear - movie.release_year (optional)
 * @returns {{ posterUrl, backdropUrl, loading }}
 */
export function useMovieImages(title, releaseYear = null) {
  const [posterUrl,   setPosterUrl]   = useState(null);
  const [backdropUrl, setBackdropUrl] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!title) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);

    fetchMovieImages(title, releaseYear).then(({ posterUrl, backdropUrl }) => {
      if (!cancelled) {
        setPosterUrl(posterUrl);
        setBackdropUrl(backdropUrl);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [title, releaseYear]);

  return { posterUrl, backdropUrl, loading };
}