import {
  Jumbotron,
  Container,
  CardColumns,
  Card,
  Button,
  Modal,
} from "react-bootstrap";

import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import { removeBookId } from "../utils/localStorage";
import { SAVE_BOOK } from "../utils/mutations";
import { UPDATE_BOOK } from "../utils/mutations";

import "../pages/pages.css";

import { CommentForm } from "../components/CommentForm";
//import { InfoModal } from "../components/InfoModal";
import Auth from "../utils/auth";

import {useState} from "react";

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// SavedBooks Component:
///////////////////////////////////////////////////////////////////////////////////////////////////////////
const SavedBooks = () => {

  /////////////////////////////////////////////////
  // Set State Hooks used for Modal Dialog box.
  /////////////////////////////////////////////////
  const [show, setShow] = useState(false);
  const [dlgTitleMsg, setDlgTitleMsg] = useState("");
  const [dlgBodyMsg, setDlgBodyMsg] = useState("");  
  const handleClose = () => setShow(false);
 
  /* eslint-disable no-unused-vars */
  const handleShow = () => setShow(true);

  const { loading, data } = useQuery(QUERY_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);
  const [saveBook, { error1 }] = useMutation(SAVE_BOOK);
  const [updateBook, { error2 }] = useMutation(UPDATE_BOOK);

  const userData = data?.me || {};

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Function handleDeleteBook - This function accepts the book's mongo _id value as param and deletes the 
  // book from the database.
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

      // Call SetState Hook routines to updated the data and display the dialog box
      // to tell the user the delete operation failed.
      setDlgTitleMsg("The Watchlist Delete Operation Failed:");
      setDlgBodyMsg("The Following Problem Occurred:\r\n\r\n" + err.message);        
      setShow(true);
    }
  };

  //////////////////////////////////////////////////////////////////////
  // FUNCTION: handleUpdateComment - LADA'S VERSION:
  //////////////////////////////////////////////////////////////////////
  //const handleUpdateComment = (bookId, updatedComment) => {
  //  console.log(bookId);
  //  console.log(updatedComment);
  //}

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // This functions deals with the Update Watch List operation.
  // It first finds the watch list item and saves the values.
  // It then deletes the current one and adds a new one with the new values.
  /////////////////////////////////////////////////////////////////////////////////////////////////
  const handleUpdateComment = async (bookId, updatedComment) => {

    let updatedBook = null;
    let nIndex = 0;
    let bookFound = false;
    let ratingValue = 0;
    let posValue = 0;
  
    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;
  
    if (!token) {
      return false;
    }
      
    try {
  
      // Loop through the saved watched items looking for a match on the bookId value passed
      // in to this function.
      for (nIndex = 0; nIndex < userData.savedBooks.length; nIndex++) {
  
        // If the bookId matches then perform the following operations.
        if (userData.savedBooks[nIndex].bookId === bookId) {
  
          // If we don't have a value then set it to zero.
          //if (ratingInput.length === 0) {
          if (updatedComment.rating.length === 0) {
            ratingValue = 0;
            updatedComment.rating = 0;
          }
          // Else convert it to an integer value.
          else {
              ratingValue = parseInt(updatedComment.rating);
          }
  
          // Create a book object and set the variables for the book that matches the bookId value passed in.
          updatedBook = {
            bookId: bookId,
            title: userData.savedBooks[nIndex].title,
            authors: userData.savedBooks[nIndex].authors,
            description: userData.savedBooks[nIndex].description,
            image: userData.savedBooks[nIndex].image,
            review: updatedComment.review,
            rating: ratingValue,
            watched: updatedComment.watched,
          };  
            
          // Set the bookFound variable to true;
          bookFound = true;
  
          // Save the index value for the position in the array.
          posValue = nIndex;

          // Found the book so set the nIndex value so we exit loop.
          nIndex = userData.savedBooks.length;
        }
      }
  
      // If the book was not found then just return false.
      if (bookFound === false) {
        return false;
      }
   
      // Update the book in the database..
      const { data2 } = await updateBook({
        variables: { posValue: posValue, bookId: bookId, bookData: { ...updatedBook } },
      });  

      // Call SetShow function to display the Modal dialog box.
      // Tell the user the update operation was performed successfully.
      setDlgTitleMsg("The Watchlist Update Operation:");
      setDlgBodyMsg("The Update Operation Was Performed Successfully!");        
      setShow(true);
    } catch (err) {
      console.error(err);

      // Call SetState hook functions to updated the text and display
      // the modal dialog box to tell the user the update operation failed.
      setDlgTitleMsg("The Watchlist Update Operation Failed:");
      setDlgBodyMsg("The Following Problem Occurred:\r\n\r\n" + err.message);        
      setShow(true);
    }  
  };

  return (
    <>
      <Jumbotron fluid className="text-light">
        <Container>
          <h1>{userData.username}'s Watchlist</h1>

        {/* ----------------------------------------------------------------- */}
        {/* Boostrap-react Modal Dialog box - Tell User Update was successful */}
        {/* ----------------------------------------------------------------- */}

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{dlgTitleMsg}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{dlgBodyMsg}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        {/* ----------------------------------------------------------------- */}

        </Container>
      </Jumbotron>
      <Container>
        {loading ? (
          <div>Still loading...</div>
        ) : (
          <div>
            <h2>
              {userData.savedBooks?.length
                ? `${userData.savedBooks.length} saved ${
                    userData.savedBooks.length === 1
                      ? "movies and tv shows"
                      : "movies and tv shows"
                  }:`
                : "You have nothing saved to your watchlist ☹"}
            </h2>
            <CardColumns>
              {userData.savedBooks.map(book =>
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

                    <br></br>
                    <CommentForm book={book} handleUpdateComment={handleUpdateComment} />
                  </Card.Body>
                </Card>
              )}
            </CardColumns>
          </div>
        )}
      </Container>
    </>
  );
};

export default SavedBooks;
