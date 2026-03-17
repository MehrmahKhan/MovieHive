-- Create database
CREATE DATABASE MovieHive;
GO
USE MovieHive;
GO

-- Users table
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user','admin')),
    created_at DATETIME DEFAULT GETDATE()
);

-- Movies table
CREATE TABLE Movies (
    movie_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    release_year INT NOT NULL CHECK (release_year >= 1888),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    created_at DATETIME DEFAULT GETDATE()
);

-- Genres
CREATE TABLE Genres (
    genre_id INT PRIMARY KEY IDENTITY(1,1),
    genre_name VARCHAR(100) NOT NULL UNIQUE
);

-- Movie_Genres
CREATE TABLE Movie_Genres (
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id) ON DELETE CASCADE
);

-- Persons
CREATE TABLE Persons(
    person_id INT PRIMARY KEY IDENTITY(1,1),
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE
);

-- Movie_Cast
CREATE TABLE Movie_Cast (
    movie_id INT NOT NULL,
    person_id INT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (movie_id, person_id),
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE Reviews (
    review_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text VARCHAR(1000),
    review_date DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_User_Movie UNIQUE (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);

-- Watchlist
CREATE TABLE Watchlist (
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    added_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);

-- Collections
CREATE TABLE Collections (
    collection_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    collection_name VARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Collection_Movies
CREATE TABLE Collection_Movies (
    collection_id INT NOT NULL,
    movie_id INT NOT NULL,
    PRIMARY KEY (collection_id, movie_id),
    FOREIGN KEY (collection_id) REFERENCES Collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);

-- Sample Users (plain passwords for testing)
INSERT INTO Users (name, email, password_hash, role)
VALUES 
('Admin', 'admin@moviehive.com', 'admin123', 'admin'),
('User', 'user@moviehive.com', 'user123', 'user');

-- Sample Movies
INSERT INTO Movies (title, description, release_year, duration_minutes)
VALUES 
('Inception', 'A mind-bending thriller', 2010, 148),
('The Dark Knight', 'Batman faces Joker', 2008, 152),
('Interstellar', 'Space exploration adventure', 2014, 169);

-- Sample Genres
INSERT INTO Genres (genre_name) VALUES ('Action'), ('Sci-Fi'), ('Thriller');

-- Assign genres to movies
INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (1,2), (1,3), (2,1), (2,3), (3,2);