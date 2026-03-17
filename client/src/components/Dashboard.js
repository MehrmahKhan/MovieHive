import React from 'react';
import './Dashboard.css';

export default function Dashboard({user}) {
    const sampleMovies = [
        {title:'Inception', year:2010},
        {title:'The Dark Knight', year:2008},
        {title:'Interstellar', year:2014},
    ];

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>MovieHive Dashboard</h1>
                <div className="user-info">
                    <p>{user.name} ({user.role})</p>
                </div>
            </header>
            <div className="movies-grid">
                {sampleMovies.map((movie,i)=>(
                    <div className="movie-card" key={i}>
                        <div className="movie-poster"></div>
                        <h3>{movie.title}</h3>
                        <p>{movie.year}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}