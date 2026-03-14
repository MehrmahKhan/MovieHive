CREATE DATABASE MovieHive;
GO

USE MovieHive;
GO

CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user','admin')),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Movies (
    movie_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    release_year INT NOT NULL CHECK (release_year >= 1888),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Genres (
    genre_id INT PRIMARY KEY IDENTITY(1,1),
    genre_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Movie_Genres (
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id) ON DELETE CASCADE
);

CREATE TABLE Persons(
    person_id INT PRIMARY KEY IDENTITY(1,1),
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE
);

CREATE TABLE Movie_Cast (
    movie_id INT NOT NULL,
    person_id INT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (movie_id, person_id),
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE CASCADE
);

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

CREATE TABLE Watchlist (
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    added_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);

CREATE TABLE Collections (
    collection_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    collection_name VARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Collection_Movies (
    collection_id INT NOT NULL,
    movie_id INT NOT NULL,
    PRIMARY KEY (collection_id, movie_id),
    FOREIGN KEY (collection_id) REFERENCES Collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);

