import React, { useState, useEffect } from 'react';

import {
  Jumbotron,
  Container,
  CardColumns,
  Card,
  Button,
  Form,
} from 'react-bootstrap';

import { useQuery, useMutation } from '@apollo/client';
import { QUERY_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { removeBookId } from '../utils/localStorage';
import { SAVE_BOOK } from '../utils/mutations';

import '../pages/pages.css';

import Auth from '../utils/auth';

const SavedBooks = () => {
  

  // create state for holding our search field data
  const [reviewInput, setReviewInput] = useState('');
  const [ratingInput, setRatingInput] = useState('0');
  const [watchedInput, setWatchedInput] = useState(false);
  const [useReviewDBValue, setUseReviewDBValue] = useState(false);
  const [useRatingDBValue, setUseRatingDBValue] = useState(false);
  const [useWatchedDBValue, setUseWatchedDBValue] = useState(false);



  const { loading, data } = useQuery(QUERY_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);
  const [saveBook, { error1 }] = useMutation(SAVE_BOOK);

  const userData = data?.me || {};

  useEffect(() => {
    setUseReviewDBValue(true);
    setUseRatingDBValue(true);
    setUseWatchedDBValue(true);
  },[]);


  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  const HandleReviewInput = async (value) => {
    setUseReviewDBValue(false);
    setReviewInput(value);
  };

  const handleUpdateWatchList = async (bookId) => {
    let updatedBook = null;
    let nIndex = 0;
    let bookFound = false;

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }
    
    try {

      for (nIndex = 0; nIndex < userData.savedBooks.length; nIndex++) {
        if (userData.savedBooks[nIndex].bookId === bookId) {

          const ratingValue = parseInt(ratingInput);

          // Create a book object and set the variables for the book that matches the bookId value passed in.
          updatedBook = {
            bookId: bookId,
            title: userData.savedBooks[nIndex].title,
            authors: userData.savedBooks[nIndex].authors,
            description: userData.savedBooks[nIndex].description,
            image: userData.savedBooks[nIndex].image,
            review: reviewInput,
            rating: ratingValue,
            watched: watchedInput,
          };  
          
          // Set the bookFound variable to true;
          bookFound = true;

          // Found the book so set the nIndex value so we exit loop.
          nIndex = userData.savedBooks.length;
        }
      }

      // If the book was not found then just return false.
      if (bookFound === false) {
        return false;
      }

      // What I want to do first is to remove the current book.
      const { data } = await removeBook({
        variables: { bookId },
      });

      // Save the new one that has been changed.
      const { data2 } = await saveBook({
        variables: { bookData: { ...updatedBook } },
      });        
  
    } catch (err) {
      console.error(err);
    }  
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h1>{userData.username}'s Watchlist</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks?.length
            ? `${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'movies and tv shows' : 'movies and tv shows'
              }:`
            : 'You have nothing saved to your watchlist ☹'}
        </h2>
        <CardColumns>
          {userData.savedBooks?.map((book) => {

            return (
              <Card key={book.bookId} border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The image for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete from watchlist
                  </Button>

                  {/* New controls added by Duane */}
                  
                  
                  <br></br>  
                  <div class="form-group">
                    <label htmlFor="review1">Review:</label>                                  
                    <Form.Control
                      name="reviewInput"
                      id="review1"
                      value={useReviewDBValue ? book.review : reviewInput}
                      onChange={(e) => HandleReviewInput(e.target.value)}
                      type="textarea"
                      rows="3"
                      class="form-control rounded-0"
                    />
                  </div>
                  
                  

                  <br></br>  
                  <label htmlFor="rating1">Rating - Enter (0 - 10) Value:</label>    
                  <Form.Control
                    name="ratingInput"
                    id="rating1"
                    value={useRatingDBValue ? book.rating : ratingInput}
                    onChange={(e) => setRatingInput(e.target.value)}
                    type="number"
                    min= "0"
                    max= "10"
                  />    

                  <br></br>                               
                  <Form.Check
                    label="Watched" 
                    name="watchedInput" 
                    id="check1" 
                    checked={useWatchedDBValue ? book.watched : watchedInput}
                    onChange={(e) => setWatchedInput(e.target.checked)} 
       
                  />
                  
                  <br></br>  
                  <Button
                    onClick={() => handleUpdateWatchList(book.bookId)} >
                    Update Watch List
                  </Button>

                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
