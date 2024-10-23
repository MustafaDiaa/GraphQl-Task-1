import { userModel as User } from "./models/user.js";
import { todoModel as Todo } from "./models/todo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const resolvers = {
  Query: {
    async fetchUsers() {
      return User.find({});
    },
    async fetchUserById(_, { id }) {
      return User.findById(id);
    },
    async fetchTodos() {
      return Todo.find({});
    },
    async fetchTodoById(_, { id }) {
      return Todo.findById(id);
    },
    async fetchTodosByUser(_, { userId }) {
      return Todo.find({ user: userId });
    },
  },

  Mutation: {
    async registerUser(_, { input }) {
      const userExists = await User.findOne({ email: input.email });
      if (userExists) throw new Error("User already exists");
      return User.create(input);
    },
    async loginUser(_, { input }) {
      const { email, password } = input;
      if (!email || !password)
        throw new Error("Email and password are required");

      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid email or password");

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new Error("Invalid email or password");

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return token;
    },
    async updateUser(_, { id, input }, context) {
      if (context.user?.role !== "admin") throw new Error("Unauthorized");
      return User.findByIdAndUpdate(id, input, { new: true });
    },
    async removeUser(_, { id }, context) {
      if (context.user?.role !== "admin") throw new Error("Unauthorized");
      await User.findByIdAndDelete(id);
      return "User deleted successfully";
    },

    async createTodo(_, { input, userId }) {
      if (!userId) throw new Error("User ID is required");
      return Todo.create({ ...input, user: userId });
    },
    async updateTodo(_, { id, input }) {
      return Todo.findByIdAndUpdate(id, input, { new: true });
    },
    async removeTodo(_, { id }) {
      await Todo.findByIdAndDelete(id);
      return "Todo deleted successfully";
    },
  },

  User: {
    async todos(parent) {
      return Todo.find({ user: parent._id });
    },
  },

  Todo: {
    async user(parent) {
      return User.findById(parent.user);
    },
  },
};
