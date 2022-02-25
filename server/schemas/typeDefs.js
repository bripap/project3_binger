const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    bookId: String!    
    authors: [String]
    description: String
    title: String!
    image: String
    link: String

  }

  input BookInput {
    authors: [String]   
    description: String   
    title: String!      
    bookId: String!    
    image: String
    link: String
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    bookCount: Int
    savedBooks: [Book]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    # Because we have the context functionality in place to check a JWT and decode its data, we can use a query that will always find and return the logged in user's data
    me: User   
    singleUser(userId: ID!): User     
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    saveBook(bookId: String!, title: String!, authors: [String], description: String, image: String): User
    deleteBook(bookId: ID!): User
  }
`;

module.exports = typeDefs;
