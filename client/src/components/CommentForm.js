import { useState } from 'react';
import {
    Button,
    Form,
} from 'react-bootstrap';

export const CommentForm = ({ book: { bookId, review, rating, watched }, handleUpdateComment }) => {
  const [comment, setComment] = useState({
    review: review ? review : '',
    rating: rating >= 0 ? rating : 0,
    watched: watched ? watched : false,
  });

  const handleInputChange = (e) => {
    const { name, checked, value } = e.target;

    setComment({
        ...comment,
        [name]: e.target.matches('input.form-check-input') ? checked : value
    });
  }

  return (
    <>
      <div className="form-group">
        <label htmlFor="review1">Review:</label>
        <Form.Control
          name="review"
          id="review1"
          value={comment.review}
          onChange={handleInputChange}
          as="textarea"
          rows="3"
          
        />
      </div>

      <br></br>
      <label htmlFor="rating1">Rating - Enter (0 - 10) Value:</label>
      <Form.Control
        name="rating"
        id="rating1"
        value={comment.rating}
        onChange={handleInputChange}
        type="number"
        min="0"
        max="10"
      />

      <br></br>
      <Form.Check
        label="Watched"
        name="watched"
        checked={comment.watched}
        onChange={handleInputChange}
      />

      <br></br>
      <Button onClick={() => handleUpdateComment(bookId, comment) }>
        Update Watch List
      </Button>
    </>
  );
};
