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

-- ============================================
-- UNIQUE CORE FEATURE TABLES (SQL-RELATED)
-- Mood-based watchlist cooldown recommendations
-- ============================================

CREATE TABLE User_Genre_Mood (
    user_id INT NOT NULL,
    genre_id INT NOT NULL,
    rolling_mood_score DECIMAL(6,3) NOT NULL,
    negative_streak INT NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY (user_id, genre_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id) ON DELETE CASCADE
);
GO

CREATE TABLE Watchlist_Cooldown (
    cooldown_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    reason VARCHAR(300) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    flagged_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    CONSTRAINT UQ_Watchlist_Cooldown_Active UNIQUE (user_id, movie_id, is_active)
);
GO

-- ============================================
-- UDF
-- ============================================

DROP FUNCTION IF EXISTS dbo.fn_ReviewSentimentScore;
GO
CREATE FUNCTION dbo.fn_ReviewSentimentScore
(
    @review_text VARCHAR(1000)
)
RETURNS INT
AS
BEGIN
    DECLARE @text VARCHAR(1000) = LOWER(ISNULL(@review_text, ''));
    DECLARE @score INT = 0;

    -- Positive keywords
    IF @text LIKE '%amazing%' SET @score = @score + 2;
    IF @text LIKE '%great%' SET @score = @score + 2;
    IF @text LIKE '%excellent%' SET @score = @score + 2;
    IF @text LIKE '%love%' SET @score = @score + 1;
    IF @text LIKE '%good%' SET @score = @score + 1;

    -- Negative keywords
    IF @text LIKE '%bad%' SET @score = @score - 1;
    IF @text LIKE '%boring%' SET @score = @score - 2;
    IF @text LIKE '%worst%' SET @score = @score - 2;
    IF @text LIKE '%awful%' SET @score = @score - 2;
    IF @text LIKE '%disappointing%' SET @score = @score - 2;

    RETURN @score;
END;
GO

-- ============================================
-- STORED PROCEDURES (LOGIN/SIGNUP)
-- ============================================

DROP PROCEDURE IF EXISTS dbo.usp_UserSignup;
GO
CREATE PROCEDURE dbo.usp_UserSignup
    @Name VARCHAR(100),
    @Email VARCHAR(150),
    @PasswordHash VARCHAR(255),
    @Role VARCHAR(20) = 'user'
AS
BEGIN
    SET NOCOUNT ON;

    SET @Name = LTRIM(RTRIM(ISNULL(@Name, '')));
    SET @Email = LTRIM(RTRIM(ISNULL(@Email, '')));
    SET @Role = LTRIM(RTRIM(ISNULL(@Role, 'user')));

    IF @Name = '' OR @Email = '' OR ISNULL(@PasswordHash, '') = ''
    BEGIN
        PRINT 'All fields are required';
        SELECT CAST(0 AS BIT) AS success, 'All fields are required' AS message;
        RETURN;
    END;

    IF @Email NOT LIKE '%_@_%._%'
    BEGIN
        PRINT 'Invalid email format';
        SELECT CAST(0 AS BIT) AS success, 'Invalid email format' AS message;
        RETURN;
    END;

    IF @Role NOT IN ('user', 'admin')
    BEGIN
        PRINT 'Invalid role';
        SELECT CAST(0 AS BIT) AS success, 'Invalid role' AS message;
        RETURN;
    END;

    IF EXISTS (SELECT 1 FROM Users WHERE email = @Email)
    BEGIN
        PRINT 'Email already exists';
        SELECT CAST(0 AS BIT) AS success, 'Email already exists' AS message;
        RETURN;
    END;

    INSERT INTO Users (name, email, password_hash, role)
    VALUES (@Name, @Email, @PasswordHash, @Role);

    SELECT
        CAST(1 AS BIT) AS success,
        'Account created successfully' AS message,
        user_id,
        name,
        email,
        role,
        created_at
    FROM Users
    WHERE user_id = SCOPE_IDENTITY();
END;
GO

DROP PROCEDURE IF EXISTS dbo.usp_UserLogin;
GO
CREATE PROCEDURE dbo.usp_UserLogin
    @Email VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Email = LTRIM(RTRIM(ISNULL(@Email, '')));

    IF @Email = ''
    BEGIN
        PRINT 'Email is required';
        SELECT CAST(0 AS BIT) AS success, 'Email is required' AS message;
        RETURN;
    END;

    IF @Email NOT LIKE '%_@_%._%'
    BEGIN
        PRINT 'Invalid email format';
        SELECT CAST(0 AS BIT) AS success, 'Invalid email format' AS message;
        RETURN;
    END;

    IF EXISTS (SELECT 1 FROM Users WHERE email = @Email)
    BEGIN
        SELECT TOP 1
            CAST(1 AS BIT) AS success,
            'User found' AS message,
            user_id,
            name,
            email,
            password_hash,
            role,
            created_at
        FROM Users
        WHERE email = @Email;
    END
    ELSE
    BEGIN
        PRINT 'Invalid credentials';
        SELECT CAST(0 AS BIT) AS success, 'Invalid credentials' AS message;
    END
END;
GO

DROP PROCEDURE IF EXISTS dbo.usp_GetCooldownSuggestions;
GO
CREATE PROCEDURE dbo.usp_GetCooldownSuggestions
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @UserId IS NULL OR @UserId <= 0
    BEGIN
        PRINT 'Valid user_id is required';
        SELECT CAST(0 AS BIT) AS success, 'Valid user_id is required' AS message;
        RETURN;
    END;

    SELECT
        wc.cooldown_id,
        wc.user_id,
        u.name AS user_name,
        wc.movie_id,
        m.title AS movie_title,
        wc.reason,
        wc.flagged_at,
        wc.is_active
    FROM Watchlist_Cooldown wc
    INNER JOIN Users u ON u.user_id = wc.user_id
    INNER JOIN Movies m ON m.movie_id = wc.movie_id
    WHERE wc.user_id = @UserId AND wc.is_active = 1
    ORDER BY wc.flagged_at DESC;
END;
GO

-- ============================================
-- VIEWS
-- ============================================

DROP VIEW IF EXISTS dbo.vw_MovieAnalytics;
GO
CREATE VIEW dbo.vw_MovieAnalytics
AS
SELECT
    m.movie_id,
    m.title,
    m.release_year,
    m.duration_minutes,
    COUNT(DISTINCT r.review_id) AS total_reviews,
    CAST(AVG(CAST(r.rating AS DECIMAL(5,2))) AS DECIMAL(5,2)) AS avg_rating,
    STRING_AGG(g.genre_name, ', ') AS genres
FROM Movies m
LEFT JOIN Reviews r ON r.movie_id = m.movie_id
LEFT JOIN Movie_Genres mg ON mg.movie_id = m.movie_id
LEFT JOIN Genres g ON g.genre_id = mg.genre_id
GROUP BY m.movie_id, m.title, m.release_year, m.duration_minutes;
GO

DROP VIEW IF EXISTS dbo.vw_WatchlistCooldownCandidates;
GO
CREATE VIEW dbo.vw_WatchlistCooldownCandidates
AS
SELECT
    wc.cooldown_id,
    wc.user_id,
    u.name AS user_name,
    wc.movie_id,
    m.title AS movie_title,
    wc.reason,
    wc.flagged_at,
    ugm.genre_id,
    g.genre_name,
    ugm.rolling_mood_score,
    ugm.negative_streak
FROM Watchlist_Cooldown wc
INNER JOIN Users u ON u.user_id = wc.user_id
INNER JOIN Movies m ON m.movie_id = wc.movie_id
INNER JOIN Movie_Genres mg ON mg.movie_id = wc.movie_id
INNER JOIN Genres g ON g.genre_id = mg.genre_id
INNER JOIN User_Genre_Mood ugm ON ugm.user_id = wc.user_id AND ugm.genre_id = g.genre_id
WHERE wc.is_active = 1;
GO

-- ============================================
-- TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS dbo.trg_Reviews_ValidationAndCooldown;
GO
CREATE TRIGGER dbo.trg_Reviews_ValidationAndCooldown
ON Reviews
AFTER INSERT, UPDATE
AS
BEGIN
    -- Basic trigger style aligned with classroom pattern:
    -- IF condition fails -> PRINT message -> ROLLBACK
    IF EXISTS (
        SELECT 1
        FROM inserted
        WHERE rating NOT BETWEEN 1 AND 5
           OR LTRIM(RTRIM(ISNULL(review_text, ''))) = ''
    )
    BEGIN
        PRINT 'Error: Rating must be between 1 and 5 and review text is required.';
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    -- Unique core feature action:
    -- when a low review is added/updated, mark related watchlist item for cooldown.
    INSERT INTO Watchlist_Cooldown (user_id, movie_id, reason, is_active)
    SELECT DISTINCT
        i.user_id,
        i.movie_id,
        'Low review detected. Take a cooldown before rewatching.',
        1
    FROM inserted i
    LEFT JOIN Watchlist_Cooldown wc
        ON wc.user_id = i.user_id
       AND wc.movie_id = i.movie_id
       AND wc.is_active = 1
    WHERE i.rating <= 2
      AND wc.cooldown_id IS NULL;
END;
GO

-- ============================================
-- PERMISSIONS
-- ============================================

-- Grant EXECUTE permission on stored procedures to the application user
GRANT EXECUTE ON dbo.usp_UserLogin TO [moviehive_app];
GRANT EXECUTE ON dbo.usp_UserSignup TO [moviehive_app];
GRANT EXECUTE ON dbo.usp_GetCooldownSuggestions TO [moviehive_app];

-- If user doesn't exist yet, create it
IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'moviehive_app')
BEGIN
    CREATE LOGIN moviehive_app WITH PASSWORD = 'your_password_here';
END;

-- Create database user if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'moviehive_app')
BEGIN
    CREATE USER moviehive_app FOR LOGIN moviehive_app;
END;

-- Grant default permissions
ALTER ROLE db_datareader ADD MEMBER moviehive_app;
ALTER ROLE db_datawriter ADD MEMBER moviehive_app;
GO

-- ============================================
-- SAMPLE DATA (for testing and demonstration)
-- ============================================

-- Insert sample genres
SET IDENTITY_INSERT Genres ON;
INSERT INTO Genres (genre_id, genre_name) VALUES (1, 'Sci-Fi');
INSERT INTO Genres (genre_id, genre_name) VALUES (2, 'Drama');
INSERT INTO Genres (genre_id, genre_name) VALUES (3, 'Thriller');
INSERT INTO Genres (genre_id, genre_name) VALUES (4, 'Action');
INSERT INTO Genres (genre_id, genre_name) VALUES (5, 'Crime');
INSERT INTO Genres (genre_id, genre_name) VALUES (6, 'Adventure');
SET IDENTITY_INSERT Genres OFF;
GO

-- Insert sample movies
SET IDENTITY_INSERT Movies ON;
INSERT INTO Movies (movie_id, title, description, release_year, duration_minutes) 
VALUES (1, 'Inception', 'A mind-bending heist film about dreams within dreams', 2010, 148);
INSERT INTO Movies (movie_id, title, description, release_year, duration_minutes) 
VALUES (2, 'The Dark Knight', 'A gritty crime thriller about Batman and the Joker', 2008, 152);
INSERT INTO Movies (movie_id, title, description, release_year, duration_minutes) 
VALUES (3, 'Interstellar', 'An epic sci-fi journey through space and time', 2014, 169);
INSERT INTO Movies (movie_id, title, description, release_year, duration_minutes) 
VALUES (4, 'The Shawshank Redemption', 'A powerful drama about hope and friendship', 1994, 142);
INSERT INTO Movies (movie_id, title, description, release_year, duration_minutes) 
VALUES (5, 'Pulp Fiction', 'A non-linear crime drama by Tarantino', 1994, 154);
INSERT INTO Movies (movie_id, title, description, release_year, duration_minutes) 
VALUES (6, 'The Matrix', 'A revolutionary sci-fi action film', 1999, 136);
SET IDENTITY_INSERT Movies OFF;
GO

-- Link movies to genres
INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (1, 1), (1, 3); -- Inception: Sci-Fi, Thriller
INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (2, 5), (2, 2); -- Dark Knight: Crime, Drama
INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (3, 1), (3, 2); -- Interstellar: Sci-Fi, Drama
INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (4, 2); -- Shawshank: Drama
INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (5, 5), (5, 2); -- Pulp Fiction: Crime, Drama
INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (6, 1), (6, 4); -- Matrix: Sci-Fi, Action
GO

-- Insert sample cast/persons
SET IDENTITY_INSERT Persons ON;
INSERT INTO Persons (person_id, full_name, birth_date) VALUES (1, 'Leonardo DiCaprio', '1974-11-11');
INSERT INTO Persons (person_id, full_name, birth_date) VALUES (2, 'Marion Cotillard', '1975-09-30');
INSERT INTO Persons (person_id, full_name, birth_date) VALUES (3, 'Christian Bale', '1974-01-30');
INSERT INTO Persons (person_id, full_name, birth_date) VALUES (4, 'Heath Ledger', '1979-04-04');
INSERT INTO Persons (person_id, full_name, birth_date) VALUES (5, 'Matthew McConaughey', '1969-11-04');
INSERT INTO Persons (person_id, full_name, birth_date) VALUES (6, 'Anne Hathaway', '1982-11-12');
INSERT INTO Persons (person_id, full_name, birth_date) VALUES (7, 'Tim Robbins', '1958-10-16');
INSERT INTO Persons (person_id, full_name, birth_date) VALUES (8, 'Morgan Freeman', '1937-06-01');
SET IDENTITY_INSERT Persons OFF;
GO

-- Link cast to movies
INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (1, 1, 'Cobb');
INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (1, 2, 'Mal');
INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (2, 3, 'Batman');
INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (2, 4, 'Joker');
INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (3, 5, 'Cooper');
INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (3, 6, 'Brand');
INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (4, 7, 'Andy');
INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (4, 8, 'Red');
GO

-- ============================================
-- TEST USERS (for demo)
-- ============================================

-- Test user: demo@test.com / Demo@123456 (regular user)
-- Test admin: admin@moviehive.com / Admin@123456 (admin user)
-- Password hashes are bcrypt(password, 10) - update with actual hashes if needed

INSERT INTO Users (name, email, password_hash, role) 
VALUES ('Demo User', 'demo@test.com', '$2b$10$Dq0pUhI0TY5Y5Y5Y5Y5Y5e.rKqYmYmYmYmYmYmYmY', 'user');

INSERT INTO Users (name, email, password_hash, role) 
VALUES ('Admin', 'admin@moviehive.com', '$2b$10$Dq0pUhI0TY5Y5Y5Y5Y5Y5e.rKqYmYmYmYmYmYmYmY', 'admin');
GO
