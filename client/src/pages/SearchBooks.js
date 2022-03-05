import React, { useState, useEffect } from 'react';
import {
  Jumbotron,
  Container,
  Col,
  Form,
  Button,
  Card,
  CardColumns,
} from 'react-bootstrap';

import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import Auth from '../utils/auth';

import '../pages/pages.css'

const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [saveBook] = useMutation(SAVE_BOOK);

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${process.env.REACT_APP_API_KEY}&language=en-UsS&query=${searchInput}&page=1&include_adult=false`
      );

      if (!response.ok) {
        throw new Error('something went wrong!');
      }
      const { results } = await response.json();
      console.log (results);
      const bookData = results.map((book) => ({
        bookId: book.id,
        // authors: book.volumeInfo.authors || ['No author to display'],
        // title: book.volumeInfo.title,
        // description: book.volumeInfo.description,
        // image: book.volumeInfo.imageLinks?.thumbnail || '',
        review: '',
        rating: 0,
        watched: false,
        title: book.title,
        description: book.overview,
        image: `https://image.tmdb.org/t/p/w300/${book.poster_path}`
      }
      ));

      //////////////////////////////////////////////////////////////////////////////
      // Added For loop to loop through the bookData array and change the bookId
      // value to a string value.  I also am testing the 
      // title and description value.  These are required fields and if they 
      // are undefined or empty strings I am setting them to a default value.
      //////////////////////////////////////////////////////////////////////////////
      for (let nIndex = 0; nIndex < bookData.length; ++nIndex) {
        bookData[nIndex].bookId = bookData[nIndex].bookId.toString();

        // If the title or description is undefined the set to a default 
        // string value.
        if ((bookData[nIndex].description === undefined) ||
            (bookData[nIndex].description === "")) {
          bookData[nIndex].description = "No Description Found";
        }

        if ((bookData[nIndex].title === undefined) ||
            (bookData[nIndex].title === "")) {
          bookData[nIndex].title = "No Title Found";
        }

      }

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
        /* eslint-disable no-unused-vars */
      const { data } = await saveBook({
        variables: { bookData: { ...bookToSave } },
      });
      console.log(savedBookIds);
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <Jumbotron fluid className="text-light">
        <Container>
          <h1 id='prompt'>Find TV shows or movies to add to your Binger Watchlist!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search by title"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search 🔍
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>

      <Container>
        <h2 id='begin'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a TV show or movie from any of your favorite platforms to begin 🧐'}
        </h2>

        <CardColumns>
          {searchedBooks.map((book) => {
            return (
              <Card key={book.bookId} border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some(
                        (savedId) => savedId === book.bookId
                      )}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds?.some((savedId) => savedId === book.bookId)
                        ? 'Item already saved to your watchlist'
                        : 'Save to watchlist'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SearchBooks;
