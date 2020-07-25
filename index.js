const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');

const Book = require('./models/book');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type Book {
    _id: ID!
    title: String!
    author: String!
    description: String
  }

  type Query {
    books: [Book!]!
    bookByTitle(title: String!): Book
    booksByAuthor(author: String!): [Book]
  }

  type Mutation {
    addBook(title: String, author: String): Book
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => {
      return Book.find()
      .then(books => {
        return books.map(book => ({ ...book._doc, _id: book.id }));
      })
      .catch(err => {
        throw err;
      });
    },
    bookByTitle(parent, { title }, context, info) {
      return Book.findOne({ title })
      .then(book => ({ ...book._doc, _id: book.id }))
      .catch(err => {
        throw err;
      });
    },
    booksByAuthor(parent, { author }, context, info) {
      return Book.find({ author })
      .then(books => {
        return books.map(book => ({ ...book._doc, _id: book.id }));
      })
      .catch(err => {
        throw err;
      });
    },
  },
  Mutation: {
    addBook: async (parent, { title, author, description }) => {
      const book = new Book({
        title,
        author,
        description,
      });

      return book
        .save()
        .then(result => {
          console.log(result);
          return { ...result._doc, _id: result._doc._id.toString() };
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.huds6.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
  .then(() => {
    // The `listen` method launches a web server.
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  })
  .catch(error => {
    console.error(error);
  })