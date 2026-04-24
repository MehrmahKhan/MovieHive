# 🎬 MovieHive - Complete Features List

**Database Project Proposal - FAST-NU Spring 2026**  
**Group:** Muhammad Abdullah (23i-0030) | Noor Fatima (23l-0946) | Mehrmah Khan (23l-0623)

---

## 📋 CORE FEATURES (From Proposal)

### 2.1 Sign Up (User) ✅
- **Functionality:**
  - Users register with name, email, and password
  - Email validation and format checking
  - Password strength requirements (8+ chars, uppercase, number, special char)
  - Unique email constraint (no duplicate accounts)
  - User account creation in database
  - Default role: "user"
- **Database Operation:**
  ```sql
  INSERT INTO users (name, email, password_hash, role, created_at)
  VALUES ('<name>', '<email>', HASH('<password>'), 'user', GETDATE())
  ```
- **Status:** ✅ Implemented
- **UI:** Signup form with validation, error messages

### 2.2 Log In (User/Admin) ✅
- **Functionality:**
  - Users and admins login with email and password
  - Credential validation against database
  - bcrypt password comparison (never plain text)
  - Role-based redirect (user → Dashboard, admin → AdminDashboard)
  - Session management (localStorage token)
  - Remember me option (future enhancement)
- **Database Operation:**
  ```sql
  SELECT user_id, name, email, role, password_hash FROM users 
  WHERE email = '<email>'
  ```
- **Status:** ✅ Implemented
- **UI:** Login form, role-based navigation, logout functionality

### 2.3 Profile Editing ✅
- **Functionality:**
  - Users can edit profile information (name, email, bio)
  - Password change with current password verification
  - Profile picture upload (future enhancement)
  - Email cannot be changed to duplicate
  - Update timestamp tracking
- **Database Operation:**
  ```sql
  UPDATE users SET name = '<name>', email = '<newemail>', 
                   password_hash = HASH('<newpassword>'),
                   updated_at = GETDATE()
  WHERE user_id = '<user_id>'
  ```
- **Status:** 🚀 Planned (Phase 4)
- **UI:** Profile settings page with edit modal

### 2.4 Movie Catalogue ✅
- **Functionality:**
  - Display complete list of all movies
  - Show: title, genre(s), release year, duration, average rating
  - Pagination for large catalogs
  - Movie cards with essential info
  - Click to view full details
  - Total movie count display
- **Database Operation:**
  ```sql
  SELECT m.movie_id, m.title, m.release_year, m.duration_minutes,
         AVG(r.rating) as avg_rating, COUNT(r.review_id) as review_count,
         STRING_AGG(g.genre_name, ', ') as genres
  FROM Movies m
  LEFT JOIN Reviews r ON r.movie_id = m.movie_id
  LEFT JOIN Movie_Genres mg ON m.movie_id = mg.movie_id
  LEFT JOIN Genres g ON mg.genre_id = g.genre_id
  GROUP BY m.movie_id, m.title, m.release_year, m.duration_minutes
  ORDER BY m.title
  ```
- **Status:** ✅ Implemented
- **UI:** Grid view, movie cards, responsive layout

### 2.5 Search Movies ✅
- **Functionality:**
  - Search by movie title (case-insensitive)
  - Search by movie description/synopsis
  - Real-time search with debouncing (300ms)
  - Display search results dynamically
  - "No results" message handling
  - Search history (future enhancement)
- **Database Operation:**
  ```sql
  SELECT * FROM Movies 
  WHERE title LIKE '%<search_query>%' 
     OR description LIKE '%<search_query>%'
  ORDER BY title
  ```
- **Status:** ✅ Implemented
- **API Endpoint:** `GET /api/movies?search=<query>`
- **UI:** Search bar, real-time results, clear search

### 2.6 Filtering Movies ✅
- **Functionality:**
  - Filter by rating (min rating slider, e.g., 7.0+, 8.0+)
  - Filter by genre (multi-select dropdown)
  - Filter by release year (year range slider)
  - Combine multiple filters
  - Clear filters button
  - Active filter indicators
- **Database Operation:**
  ```sql
  SELECT * FROM Movies m
  LEFT JOIN Movie_Genres mg ON m.movie_id = mg.movie_id
  LEFT JOIN Genres g ON mg.genre_id = g.genre_id
  LEFT JOIN Reviews r ON m.movie_id = r.movie_id
  WHERE (g.genre_name = '<genre>' OR <genre> IS NULL)
    AND (m.release_year >= <min_year> AND m.release_year <= <max_year>)
    AND (AVG(r.rating) >= <min_rating> OR <min_rating> IS NULL)
  GROUP BY m.movie_id
  ```
- **Status:** ✅ Implemented (genre + search, rating pending)
- **UI:** Filter sidebar, sliders, checkboxes, chips

### 2.7 Rating System ✅
- **Functionality:**
  - Users rate movies on 1-5 star scale
  - One rating per user per movie (unique constraint)
  - Average rating calculated and displayed
  - Rating count shown (e.g., "4.2/5 (125 ratings)")
  - Rating distribution histogram (future)
  - Edit existing rating
- **Database Operation:**
  ```sql
  INSERT INTO Reviews (user_id, movie_id, rating, review_text, review_date)
  VALUES (<user_id>, <movie_id>, <rating>, '<text>', GETDATE())
  
  SELECT AVG(CAST(rating AS DECIMAL(5,2))) as avg_rating,
         COUNT(*) as rating_count
  FROM Reviews
  WHERE movie_id = <movie_id>
  GROUP BY movie_id
  ```
- **Status:** 🚀 Planned (Phase 3)
- **UI:** Star rating widget, rating display, submit form

### 2.8 Reviews ✅
- **Functionality:**
  - Users write text reviews for movies
  - Review visibility to other users
  - Edit own reviews
  - Delete own reviews (with confirmation)
  - Admin can delete inappropriate reviews
  - Review date/timestamp
  - Review sorting (newest, highest-rated, most-helpful)
  - Helpful/unhelpful votes on reviews
- **Database Operation:**
  ```sql
  INSERT INTO Reviews (user_id, movie_id, rating, review_text, review_date)
  VALUES (<user_id>, <movie_id>, <rating>, '<review_text>', GETDATE())
  
  UPDATE Reviews SET review_text = '<new_text>', review_date = GETDATE()
  WHERE review_id = <id> AND user_id = <user_id>
  
  DELETE FROM Reviews WHERE review_id = <id> AND user_id = <user_id>
  ```
- **Status:** 🚀 Planned (Phase 3)
- **UI:** Review form, review list, edit/delete buttons, helpful votes

### 2.9 Watchlist ✅
- **Functionality:**
  - Users add movies to personal watchlist
  - Watchlist is private by default (can be shared)
  - Remove movies from watchlist
  - Watchlist item count display
  - View all watchlist movies
  - Mark as watched/unwatched
  - Watchlist organization by added date
- **Database Operation:**
  ```sql
  INSERT INTO Watchlist (user_id, movie_id, added_at)
  VALUES (<user_id>, <movie_id>, GETDATE())
  
  SELECT m.* FROM Movies m
  JOIN Watchlist w ON m.movie_id = w.movie_id
  WHERE w.user_id = <user_id>
  ORDER BY w.added_at DESC
  
  DELETE FROM Watchlist WHERE user_id = <user_id> AND movie_id = <movie_id>
  ```
- **Status:** 🚀 Planned (Phase 4)
- **UI:** Add to watchlist button, watchlist page, watchlist sidebar

### 2.10 Cast and Crew Information ✅
- **Functionality:**
  - Display cast members for each movie
  - Display crew members (directors, producers)
  - Actor/crew profile with:
    - Full name
    - Birth date
    - Role in movie (Actor, Director, Producer)
    - Other movies they've worked on
  - Search movies by actor/director name
- **Database Tables:**
  ```sql
  Persons (person_id, full_name, birth_date)
  Movie_Cast (movie_id, person_id, role_name)
  ```
- **Status:** ✅ Database ready, 🚀 UI pending (Phase 4)
- **UI:** Cast section on movie detail page, clickable actor profiles

### 2.11 Trending Movies ✅
- **Functionality:**
  - Show movies with highest ratings
  - Show most-reviewed movies
  - Show movies with recent activity
  - Trending section on homepage
  - Daily/weekly/monthly trending options
  - Top 10 movies widget
- **Database Operation:**
  ```sql
  SELECT TOP 10 m.movie_id, m.title, m.release_year,
         AVG(CAST(r.rating AS DECIMAL(5,2))) as avg_rating,
         COUNT(r.review_id) as review_count
  FROM Movies m
  LEFT JOIN Reviews r ON m.movie_id = r.movie_id
  WHERE r.review_date >= DATEADD(WEEK, -1, GETDATE())
  GROUP BY m.movie_id, m.title, m.release_year
  ORDER BY avg_rating DESC, review_count DESC
  ```
- **Status:** 🚀 Planned (Phase 4)
- **UI:** Trending carousel, trending widget, trending page

### 2.12 Admin Management ✅
- **Functionality:**
  - Add new movies to database
  - Update existing movie details
  - Delete movies (with cascade delete of reviews)
  - Manage movie genres
  - View inappropriate reviews
  - Delete/hide inappropriate reviews
  - Ban users (future)
  - System analytics dashboard
- **Permissions:**
  - Only admin role can access admin features
  - Admin code required during signup (ADMIN2026)
  - Role check on backend endpoints
- **Status:** ✅ Add movie implemented, 🚀 Rest planned (Phase 4+)
- **UI:** Admin dashboard, add movie form, review moderation panel

---

## 🌟 ENHANCED FEATURES (Beyond Proposal)

### 3.1 Social Features - Friends System 🚀
- **Functionality:**
  - Send friend requests to other users
  - Accept/reject friend requests
  - View friends list
  - Remove friends
  - Friends' activity feed
  - See friends' rated movies
  - See friends' watchlists
- **Database Tables:**
  ```sql
  Friends (friend_id, user_id1, user_id2, status, created_at)
  -- status: 'pending', 'accepted', 'blocked'
  ```
- **Status:** 🚀 Planned (Phase 5)
- **UI:** Friends page, friend requests, activity feed

### 3.2 Collections & Lists 🚀
- **Functionality:**
  - Create custom collections (e.g., "2024 Favorites", "Must Watch")
  - Add/remove movies from collections
  - Reorder movies in collections
  - Edit collection name and description
  - Make collection public/private
  - Share collections with friends
  - Like/follow collections from other users
- **Database Tables:**
  ```sql
  Collections (collection_id, user_id, collection_name, description, 
               is_public, created_at)
  Collection_Movies (collection_id, movie_id, added_at)
  ```
- **Status:** 🚀 Planned (Phase 4)
- **UI:** Collections page, create collection modal, collection view

### 3.3 Shared Collections (Collaborative Lists) 🚀
- **Functionality:**
  - Multiple users contribute to shared collection
  - Invite users to collaborate on collection
  - Each contributor can add/remove movies
  - View contributor activity
  - Vote on movie additions (democratic)
  - Collection progress/completion tracker
- **Database Tables:**
  ```sql
  Collection_Collaborators (collection_id, user_id, role, added_at)
  -- role: 'owner', 'editor', 'viewer'
  ```
- **Status:** 🚀 Planned (Phase 5)
- **UI:** Invite collaborators, collaboration view, activity feed

### 3.4 Discussion Forum 🚀
- **Functionality:**
  - Movie discussion threads on each movie page
  - Create discussion posts
  - Reply to posts (nested comments)
  - Like/upvote useful discussions
  - Pin important discussions (admin)
  - Spam/inappropriate post moderation (admin)
  - Discussion tags (e.g., #spoilers, #theory)
- **Database Tables:**
  ```sql
  Discussions (discussion_id, movie_id, user_id, title, content, created_at)
  Discussion_Replies (reply_id, discussion_id, user_id, content, created_at)
  Discussion_Votes (vote_id, discussion_id/reply_id, user_id, vote_type)
  ```
- **Status:** 🚀 Planned (Phase 5)
- **UI:** Discussion threads, reply form, voting buttons, moderation panel

### 3.5 User Journal/Diary 🚀
- **Functionality:**
  - Personal movie journal/diary for each user
  - Record watching experience and thoughts
  - Add date watched
  - Mood while watching
  - Detailed thoughts and analysis
  - Private vs public journal entries
  - Journal entry search and filtering
  - Yearly statistics (movies watched, avg rating)
- **Database Tables:**
  ```sql
  Journal_Entries (entry_id, user_id, movie_id, entry_date, 
                   content, mood, is_public, created_at)
  ```
- **Status:** 🚀 Planned (Phase 6)
- **UI:** Journal page, journal entry form, yearly stats

### 3.6 User Profiles 🚀
- **Functionality:**
  - Public user profile page
  - Display user's reviews and ratings
  - Show user's watchlist (if public)
  - Show user's collections
  - Show user's favorite genres
  - User's watching statistics
  - Follow/unfollow users
  - Send messages to users (future)
- **Database Tables:**
  ```sql
  User_Profiles (user_id, bio, profile_picture, favorite_genre, 
                 is_public, created_at)
  ```
- **Status:** 🚀 Planned (Phase 5)
- **UI:** Profile page, profile settings, user stats

### 3.7 Recommendations & Personalization 🚀
- **Functionality:**
  - Personalized movie recommendations based on:
    - Genres user rated highly
    - Movies similar to rated movies
    - Trending in user's favorite genres
    - Friend recommendations
    - Watched history analysis
  - Recommendation algorithm (collaborative filtering)
  - "Because you watched..." suggestions
  - Mood-based recommendations
- **Database Operation:**
  ```sql
  -- Example: Recommend movies in genres user rated highly
  SELECT TOP 5 m.movie_id, m.title, AVG(r.rating) as score
  FROM Movies m
  JOIN Movie_Genres mg ON m.movie_id = mg.movie_id
  JOIN Genres g ON mg.genre_id = g.genre_id
  WHERE g.genre_id IN (
    SELECT TOP 3 mg2.genre_id FROM Movie_Genres mg2
    JOIN Reviews r2 ON r2.movie_id = mg2.movie_id
    WHERE r2.user_id = @user_id AND r2.rating >= 4
    GROUP BY mg2.genre_id ORDER BY AVG(r2.rating) DESC
  )
  AND m.movie_id NOT IN (
    SELECT movie_id FROM Reviews WHERE user_id = @user_id
  )
  GROUP BY m.movie_id, m.title
  ORDER BY score DESC
  ```
- **Status:** 🚀 Planned (Phase 6)
- **UI:** Recommendation carousel, "For You" page, suggestions on homepage

### 3.8 Notifications 🚀
- **Functionality:**
  - Friend request notifications
  - Comment/reply on review notifications
  - Mention notifications (@username)
  - New review on watched movie notification
  - Friend activity notifications
  - Collection updates (if collaborating)
  - Notification preferences (email, in-app)
  - Mark as read/unread
- **Database Tables:**
  ```sql
  Notifications (notification_id, user_id, type, related_user_id, 
                 related_movie_id, message, is_read, created_at)
  ```
- **Status:** 🚀 Planned (Phase 6)
- **UI:** Notification bell, notification center, notification settings

### 3.9 Movie Lists (IMDb Style) 🚀
- **Functionality:**
  - Create "Top 10 Movies of All Time"
  - Create "Worst Movies" lists
  - Create "Underrated Movies" lists
  - Lists have descriptions and rankings
  - Vote on list quality
  - See most popular lists from community
  - Similar to Collections but more structured
- **Database Tables:**
  ```sql
  Movie_Lists (list_id, user_id, list_title, description, 
               rank_type, is_public, created_at)
  List_Movies (list_id, movie_id, rank_position)
  ```
- **Status:** 🚀 Planned (Phase 5)
- **UI:** Top lists, list rankings, voting

### 3.10 Movie Ratings Breakdown 🚀
- **Functionality:**
  - Show rating distribution (5 stars, 4 stars, etc.)
  - Percentage breakdown chart
  - Total number of ratings
  - Demographics of raters (if available)
  - Helpful/Most recent filter for reviews
- **Database Operation:**
  ```sql
  SELECT rating, COUNT(*) as count, 
         ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Reviews WHERE movie_id = @movie_id), 2) as percentage
  FROM Reviews
  WHERE movie_id = @movie_id
  GROUP BY rating
  ORDER BY rating DESC
  ```
- **Status:** 🚀 Planned (Phase 4)
- **UI:** Rating chart/histogram on movie detail page

### 3.11 Advanced Search & Discovery 🚀
- **Functionality:**
  - Advanced search filters (actor, director, year range, etc.)
  - Saved searches
  - Search suggestions/autocomplete
  - Search history
  - Browse by decade
  - Browse by actor/director
  - Similar movies recommendations
  - "People who liked this also liked..." feature
- **Database Operation:**
  ```sql
  -- Example: Search by multiple criteria
  SELECT DISTINCT m.* FROM Movies m
  JOIN Movie_Genres mg ON m.movie_id = mg.movie_id
  JOIN Genres g ON mg.genre_id = g.genre_id
  JOIN Movie_Cast mc ON m.movie_id = mc.movie_id
  JOIN Persons p ON mc.person_id = p.person_id
  WHERE m.release_year BETWEEN @start_year AND @end_year
    AND g.genre_name IN (@genres)
    AND p.full_name LIKE '%@actor%'
  ```
- **Status:** 🚀 Planned (Phase 5)
- **UI:** Advanced search form, search suggestions

### 3.12 Watchlist Features 🚀
- **Functionality:**
  - Mark movies as "watched" vs "to watch"
  - Track watch date
  - Watchlist priority/ranking
  - Export watchlist (CSV)
  - Watchlist sharing link
  - Watchlist collaboration
  - Random movie from watchlist picker
- **Database Tables:**
  ```sql
  Watchlist (user_id, movie_id, added_at, watched_at, priority, is_shared)
  ```
- **Status:** 🚀 Planned (Phase 4)
- **UI:** Watchlist management page, watched status toggle

### 3.13 User Badges & Achievements 🚀
- **Functionality:**
  - "Critic" badge (50+ reviews)
  - "Power User" badge (1000+ watchlist items)
  - "Trendsetter" badge (rated movie 5 stars before trending)
  - "Movie Buff" badge (watched from multiple decades)
  - Genre specialist badges
  - Level system (Novice → Expert)
  - Display badges on profile
- **Database Tables:**
  ```sql
  User_Badges (badge_id, user_id, badge_type, earned_at)
  ```
- **Status:** 🚀 Planned (Phase 6)
- **UI:** Badges on profile, achievement notifications

### 3.14 Review Helpfulness & Voting 🚀
- **Functionality:**
  - Users mark reviews as helpful/unhelpful
  - Sort reviews by helpfulness
  - Most helpful reviews displayed first
  - Review quality score calculation
  - Review credibility (helpful % of reviews)
- **Database Tables:**
  ```sql
  Review_Votes (vote_id, review_id, user_id, vote_type)
  -- vote_type: 'helpful', 'unhelpful'
  ```
- **Status:** 🚀 Planned (Phase 4)
- **UI:** Helpful/unhelpful buttons on reviews, helpful count

### 3.15 Mood-Based Movie Picker 🚀
- **Functionality (Unique Feature):**
  - Select current mood (happy, sad, excited, thoughtful, etc.)
  - Get movie recommendations based on mood
  - Cooldown system: don't recommend low-rated movies after negative review
  - Auto-save user mood preferences
  - Track mood history
  - Find movies for specific moods
- **Database Tables:**
  ```sql
  User_Genre_Mood (user_id, genre_id, mood_type, preference_score)
  Watchlist_Cooldown (user_id, movie_id, triggered_date, reason)
  -- reason: 'low_rating', 'negative_review', etc.
  ```
- **Status:** ✅ Database ready, 🚀 UI pending (Phase 3)
- **UI:** Mood picker on dashboard, mood recommendations carousel

---

## 📊 FEATURE IMPLEMENTATION ROADMAP

### Phase 1: Core Auth & UI ✅
- [x] Sign up
- [x] Log in
- [x] Dashboard
- [x] Role-based routing

### Phase 2: Movie Discovery ✅
- [x] Movie catalogue
- [x] Search movies
- [x] Filter by genre
- [x] Movie detail page
- [x] Cast/crew database

### Phase 3: Reviews & Ratings 🚀
- [ ] Rating system
- [ ] Review submission
- [ ] Review display
- [ ] Mood-based picker UI
- [ ] Cooldown notifications

### Phase 4: Watchlist & Admin 🚀
- [ ] Watchlist management
- [ ] Mark as watched
- [ ] Profile editing
- [ ] Movie management (admin)
- [ ] Review moderation (admin)
- [ ] Rating breakdown charts
- [ ] Helpful reviews voting

### Phase 5: Social & Sharing 🚀
- [ ] Friends system
- [ ] Collections & lists
- [ ] Shared collections
- [ ] Discussion forum
- [ ] User profiles
- [ ] Movie lists (Top 10, etc.)
- [ ] Advanced search
- [ ] Recommendations

### Phase 6: Advanced Features 🚀
- [ ] User journal/diary
- [ ] Notifications system
- [ ] User badges & achievements
- [ ] Recommendations algorithm
- [ ] Activity feed
- [ ] Private messaging (future)

---

## 🎯 UNIQUE/STANDOUT FEATURES

1. **Mood-Based Movie Picker** - Users select mood, get recommendations
2. **Watchlist Cooldown System** - Auto-prevents low-rated movie recommendations
3. **Shared Collections** - Friends collaborate on movie lists
4. **Discussion Forum** - Community discussions on each movie
5. **User Journal** - Personal movie watching diary
6. **Sentiment Analysis** - Analyze review text for positive/negative keywords
7. **Activity Feed** - See what friends are rating/watching

---

## 📱 USER INTERFACE COMPONENTS

### Homepage
- Search bar
- Featured/trending movies carousel
- Mood picker quick access
- Recent activity from friends
- Top-rated movies

### Movie Detail Page
- Movie poster & basic info
- Rating & review count
- Cast & crew
- User rating (if logged in)
- Review form & existing reviews
- Watchlist button
- Discussions section
- Similar movies

### User Dashboard
- Personalized recommendations
- My watchlist (quick view)
- Recently reviewed
- Activity summary
- Collections shortcuts

### Admin Dashboard
- System statistics
- Add movie form
- Review moderation queue
- User management
- Analytics charts

### User Profile
- Public profile info
- Reviews & ratings
- Watchlist (if public)
- Collections
- Achievements/badges
- Statistics (movies watched, favorite genre)

---

## 🔧 TECHNICAL REQUIREMENTS

### Database
- SQL Server Express
- 15+ tables (including junction tables)
- Stored procedures for complex queries
- Views for common aggregations
- Triggers for data validation
- Indexes for performance
- Foreign key constraints with CASCADE

### Backend
- Node.js + Express
- RESTful API
- Parameterized queries (SQL injection prevention)
- Role-based endpoint protection
- Error handling & logging
- Pagination for large result sets

### Frontend
- React with state management
- React Router for navigation
- Tailwind CSS for styling
- Real-time search with debouncing
- Form validation
- Responsive design
- Dark/light theme toggle (future)

---

## ✨ SUMMARY

**MovieHive** is a comprehensive movie discovery and social platform combining:
- **IMDb-like browsing** (search, filter, ratings)
- **Letterboxd-like journaling** (diary, mood tracking)
- **Social features** (friends, shared collections, discussions)
- **Unique cooldown system** (mood-based recommendations)

**12 core features** (from proposal) + **15 enhanced features** = **27 total features**

---

**Status:** 🎬 Phase 2 Complete | ✅ 2/6 phases implemented | 🚀 4 phases remaining

