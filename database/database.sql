-- MovieHive Database Schema (SQL Server)
-- Official schema for movie discovery and review platform

CREATE DATABASE MovieDB;
GO
USE MovieDB;
GO

-- ============================================
-- TABLES
-- ============================================

-- Users Table: Stores user account information
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user','admin')),
    created_at DATETIME DEFAULT GETDATE()
);

-- Movies Table: Stores movie information
CREATE TABLE Movies (
    movie_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    release_year INT CHECK (release_year >= 1888),
    duration_minutes INT CHECK (duration_minutes > 0),
    created_at DATETIME DEFAULT GETDATE()
);

-- Genres Table: Stores movie genre categories
CREATE TABLE Genres (
    genre_id INT PRIMARY KEY IDENTITY(1,1),
    genre_name VARCHAR(100) NOT NULL UNIQUE
);

-- Movie_Genres: Bridging table for many-to-many relationship between Movies and Genres
CREATE TABLE Movie_Genres (
    movie_id INT,
    genre_id INT,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id) ON DELETE CASCADE
);

-- Persons Table: Stores cast and crew information
CREATE TABLE Persons (
    person_id INT PRIMARY KEY IDENTITY(1,1),
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE
);

-- Movie_Cast: Bridging table for many-to-many relationship between Movies and Persons (cast/crew)
CREATE TABLE Movie_Cast (
    movie_id INT,
    person_id INT,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (movie_id, person_id),
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE CASCADE
);

-- Reviews Table: Stores user reviews and ratings for movies
CREATE TABLE Reviews (
    review_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text VARCHAR(1000),
    review_date DATETIME DEFAULT GETDATE(),
    UNIQUE (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);

-- Watchlist Table: Stores movies that users want to watch
CREATE TABLE Watchlist (
    user_id INT,
    movie_id INT,
    added_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);

-- Collections Table: Stores user-created movie collections
CREATE TABLE Collections (
    collection_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    collection_name VARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Collection_Movies: Bridging table for many-to-many relationship between Collections and Movies
CREATE TABLE Collection_Movies (
    collection_id INT,
    movie_id INT,
    PRIMARY KEY (collection_id, movie_id),
    FOREIGN KEY (collection_id) REFERENCES Collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);