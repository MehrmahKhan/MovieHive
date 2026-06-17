import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useMovieImages } from '../hooks/useMovieImages';

// ── Individual movie card with TMDB poster ────────────────
function MovieCard({ movie, onClick }) {
  const { posterUrl, loading } = useMovieImages(movie.title, movie.release_year);

  return (
    <div
      onClick={onClick}
      className="rounded-sm overflow-hidden transition cursor-pointer hover:scale-105 hover:shadow-lg"
      style={{ backgroundColor: 'rgba(29, 31, 43, 0.85)', borderColor: '#3b3c45', borderWidth: '1px', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── POSTER IMAGE ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', overflow: 'hidden', backgroundColor: '#12161f' }}>
        {loading ? (
          // Shimmer skeleton while TMDB loads
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(90deg, #1a1f2e 25%, #252b3b 50%, #1a1f2e 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }} />
        ) : posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          // Fallback: first letter of title
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #262626, #1d1f2b)' }}>
            <span style={{ fontSize: '64px', fontWeight: '800', color: '#f4d320', opacity: 0.3 }}>
              {movie.title?.[0] ?? '?'}
            </span>
          </div>
        )}

        {/* Rating badge pinned to top-right */}
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          color: '#f4d320', fontWeight: '700', fontSize: '13px',
          padding: '3px 8px', borderRadius: '6px',
        }}>
          {movie.avg_rating ? `★ ${parseFloat(movie.avg_rating).toFixed(1)}` : 'N/A'}
        </div>
      </div>

      {/* ── INFO SECTION ── */}
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h4 className="text-base font-light line-clamp-2" style={{ color: '#f4f4f4', margin: 0 }}>
          {movie.title}
        </h4>
        <div className="flex flex-wrap gap-1">
          {movie.genres && movie.genres.split(', ').map(g => (
            <span key={g} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(59, 60, 69, 0.5)', color: '#c7c7cc' }}>
              {g}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #3b3c45' }}>
          <span className="text-sm font-light" style={{ color: '#afafba' }}>
            {movie.release_year} · {movie.duration_minutes}m
          </span>
        </div>
        <p className="text-xs font-light mb-0" style={{ color: '#595574' }}>
          {movie.total_reviews ?? movie.review_count ?? 0} reviews
        </p>
      </div>
    </div>
  );
}

// ── Shimmer keyframe injected once ───────────────────────
const shimmerStyle = document.createElement('style');
shimmerStyle.textContent = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
if (!document.head.querySelector('[data-shimmer]')) {
  shimmerStyle.setAttribute('data-shimmer', '1');
  document.head.appendChild(shimmerStyle);
}

// ── Dashboard ─────────────────────────────────────────────
export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear] = useState('');
  const [selectedActor, setSelectedActor] = useState('');
  const [genres, setGenres] = useState([]);
  const [browseSection, setBrowseSection] = useState('discover');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/movies/genres/list');
        const data = await res.json();
        if (data.success) setGenres(data.genres);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        let url = 'http://localhost:3001/api/movies?';
        if (browseSection !== 'discover') {
          url = `http://localhost:3001/api/movies/browse/${browseSection}`;
        } else {
          if (searchTerm)    url += `search=${encodeURIComponent(searchTerm)}&`;
          if (selectedGenre) url += `genre=${encodeURIComponent(selectedGenre)}&`;
          if (selectedActor) url += `actor=${encodeURIComponent(selectedActor)}&`;
          if (minRating)     url += `minRating=${encodeURIComponent(minRating)}&`;
          if (minYear)       url += `minYear=${encodeURIComponent(minYear)}&`;
          if (maxYear)       url += `maxYear=${encodeURIComponent(maxYear)}&`;
        }
        const res  = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setMovies(data.movies || []);
        } else {
          setMovies([]);
          setErrorMessage(data.message || 'Failed to load movies for this section');
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setMovies([]);
        setErrorMessage('Network error while loading movies. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchMovies, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre, selectedActor, minRating, minYear, maxYear, browseSection]);

  const sectionTitle =
    browseSection === 'trending'   ? 'Trending Now'       :
    browseSection === 'upcoming'   ? 'Upcoming Releases'  :
    browseSection === 'top-rated'  ? 'Top Rated Picks'    :
                                     'Discover Movies';

  const inputStyle = { backgroundColor: '#ececec', borderColor: '#3b3c45', borderWidth: '2px', color: '#262626' };

  return (
    <div className="moviehive-page" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Navbar user={user} onLogout={onLogout} activeBrowseSection={browseSection} onBrowseSectionChange={setBrowseSection} />

      <section className="moviehive-shell">
        <div className="moviehive-hero">
          <h2 className="text-5xl font-light leading-tight mb-4 tracking-tight moviehive-accent">MovieHive</h2>
          <p className="font-light moviehive-subtle">{sectionTitle}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="moviehive-shell pt-0">
        <div className="moviehive-panel">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input type="text" placeholder="Search movies by title..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} className="px-4 py-3 rounded-lg"
              disabled={browseSection !== 'discover'} style={inputStyle} />
            <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}
              className="px-4 py-3 rounded-lg" disabled={browseSection !== 'discover'} style={inputStyle}>
              <option value="">All Genres</option>
              {genres.map(g => <option key={g.genre_id} value={g.genre_name}>{g.genre_name}</option>)}
            </select>
            <select value={minRating} onChange={e => setMinRating(e.target.value)}
              className="px-4 py-3 rounded-lg" disabled={browseSection !== 'discover'} style={inputStyle}>
              <option value="">Min Rating</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ Stars</option>)}
            </select>
            <input type="number" placeholder="Release Year" value={minYear}
              onChange={e => setMinYear(e.target.value)} className="px-4 py-3 rounded-lg"
              disabled={browseSection !== 'discover'} min="1900" max={new Date().getFullYear()} style={inputStyle} />
            <input type="text" placeholder="Search by actor name..." value={selectedActor}
              onChange={e => setSelectedActor(e.target.value)} className="px-4 py-3 rounded-lg"
              disabled={browseSection !== 'discover'} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Movie Grid */}
      <section className="moviehive-shell pt-0 pb-12">
        <div className="moviehive-panel">
          <h3 className="text-2xl font-light mb-8 tracking-tight moviehive-heading">
            {loading ? 'Loading...' : `${sectionTitle}: ${movies.length} movie${movies.length !== 1 ? 's' : ''}`}
          </h3>

          {errorMessage && (
            <div style={{ textAlign: 'center', color: '#ffb4b4', marginBottom: 16 }}>{errorMessage}</div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', color: '#afafba' }}>Loading movies...</div>
          ) : movies.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#afafba' }}>
              {browseSection === 'discover'
                ? 'No movies found. Try different search terms or filters.'
                : `No movies available in ${sectionTitle} right now.`}
            </div>
          ) : (
            // ── Poster grid: narrower columns to show portrait posters properly ──
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {movies.map(movie => (
                <MovieCard
                  key={movie.movie_id}
                  movie={movie}
                  onClick={() => navigate(`/movie/${movie.movie_id}`, { state: { from: 'home' } })}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-12 mt-12" style={{ borderTopColor: '#3b3c45', borderTopWidth: '1px' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-xs uppercase tracking-widest font-medium mb-4" style={{ color: '#595574' }}>Product</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><button onClick={() => setBrowseSection('discover')}  className="transition hover:text-white" style={{ color: '#afafba' }}>Discover</button></li>
              <li><button onClick={() => setBrowseSection('trending')}  className="transition hover:text-white" style={{ color: '#afafba' }}>Trending</button></li>
              <li><button onClick={() => setBrowseSection('top-rated')} className="transition hover:text-white" style={{ color: '#afafba' }}>Top Rated</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest font-medium mb-4" style={{ color: '#595574' }}>Legal</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><button className="transition hover:text-white" style={{ color: '#afafba' }}>Privacy</button></li>
              <li><button className="transition hover:text-white" style={{ color: '#afafba' }}>Terms</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest font-medium mb-4" style={{ color: '#595574' }}>Company</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><button className="transition hover:text-white" style={{ color: '#afafba' }}>About</button></li>
              <li><button className="transition hover:text-white" style={{ color: '#afafba' }}>Contact</button></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 text-center text-xs font-light" style={{ borderTopColor: '#3b3c45', borderTopWidth: '1px', color: '#595574' }}>
          <p>MovieHive 2026 - Database Project - FAST NU</p>
        </div>
      </footer>
    </div>
  );
}