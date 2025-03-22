import { Children, use, useEffect, useRef, useState } from "react";
import { useMovies } from "./useMovies";
import RatingStars from "./RatingStars";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "53d06514";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectingMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleClosingMovie() {
    setSelectedId(null);
  }
  function handleAddingWatchedMovie(movie) {
    setWatched((watchedMovies) => [...watchedMovies, movie]);
  }
  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  const { movies, error, isLoading } = useMovies(query, KEY);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Found movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMsg error={error} />}
          {!isLoading && !error && (
            <QueriedMoviesList
              movies={movies}
              onSelectMovie={handleSelectingMovie}
            />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleClosingMovie}
              onAddingWatchedMovie={handleAddingWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const searchEl = useRef(null);

  //To make the search bar focused on the initial render
  useEffect(() => {
    searchEl.current.focus();
  }, []);

  //To make the search bar focused when hitting 'Enter'
  useKey("Enter", () => {
    if (document.activeElement === searchEl.current) return;
    searchEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={searchEl}
    />
  );
}

function Found({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <ToggleButton isOpen={isOpen} onClick={setIsOpen} />
      {isOpen && children}
    </div>
  );
}

function QueriedMoviesList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <QueriedMovie
          movie={movie}
          key={movie.imdbID}
          onSelectMovie={onSelectMovie}
        />
      ))}
    </ul>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMsg({ error }) {
  return <p className="error">⛔ {error} ⛔</p>;
}

function QueriedMovie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function ToggleButton({ isOpen, onClick }) {
  return (
    <button className="btn-toggle" onClick={() => onClick((open) => !open)}>
      {isOpen ? "–" : "+"}
    </button>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddingWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Poster: poster,
    Title: title,
    Released: released,
    imdbRating,
    Plot: plot,
    Actors: actors,
    Director: director,
    Genre: genre,
    Runtime: runtime,
  } = movie;

  function handleAddMovie() {
    const newMovie = {
      imdbID: selectedId,
      poster,
      title,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddingWatchedMovie(newMovie);
    onCloseMovie();
  }

  useEffect(() => {
    async function fetchingMovie() {
      try {
        setIsLoading(true);

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );

        if (!res.ok) throw new Error("Something went wrong with fetchnig data");

        const data = await res.json();

        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchingMovie();
  }, [selectedId]);

  useEffect(() => {
    if (!title) return;

    document.title = `Movie | ${title}`;

    return () => (document.title = "usePopcorn");
  }, [title]);

  useKey("Escape", onCloseMovie);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title}`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released}&bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {isWatched ? (
                <p>
                  You have already rated that movie with {watchedUserRating}
                  <span>✨</span>
                </p>
              ) : (
                <>
                  <RatingStars size={24} onSetRating={setUserRating} />

                  {userRating && (
                    <button className="btn-add" onClick={handleAddMovie}>
                      + Add to watched list
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Summary({ watched }) {
  const avgImdbRating =
    Math.round(average(watched.map((movie) => movie.imdbRating)) * 100) / 100;
  const avgUserRating =
    Math.round(average(watched.map((movie) => movie.userRating)) * 100) / 100;
  const avgRuntime =
    Math.round(average(watched.map((movie) => movie.runtime)) * 100) / 100;

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteMovie={onDeleteMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
