const { Schema } = require('mongoose');

// This is a subdocument schema, it won't become its own model but we'll use it as the schema for the User's `savedBooks` array in User.js
const bookSchema = new Schema({
  authors: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: true,
    default: "No Description Found",    
  },
  // saved book id from GoogleBooks
  bookId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
  title: {
    type: String,
    required: true,
    default: "No Title Found",
  },
  review: {
    type: String,
    default: "",
  }, 
  rating: {
    type: Number,
    default: 0,
  },
  watched: {
    type: Boolean,
    default: false
  }
});

module.exports = bookSchema;
