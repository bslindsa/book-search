const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        user: async () => {
            return User.findOne({ username }).populate('books');
        }
    },

    Mutation: {
        createUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect email or password');
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { savedBooks }, context) => {
            if (context.user) {
                const book = await Book.findOneAndDelete({
                    _id: bookId
                });
                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book._id } }
                )
                return book;
            }
            throw new AuthenticationError('You must be logged in')
        },
        deleteBook: async (parent, { savedBooks }, context) => {
            if (context.user) {
                const book = await Book.findOneAndDelete({
                    _id: bookId
                });

                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { books: book._id } }
                );

                return book;
            }
            throw new AuthenticationError('You must be looged in')
        }
    }
};

module.exports = resolvers;