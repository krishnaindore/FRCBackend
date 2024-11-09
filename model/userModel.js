// models/userModel.js
const db = require('../db.js');

// Get all users
const getAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
};

// Get user by ID
const getUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

// Create a new user
const createUser = async (user) => {
  const { name, email } = user;
  const [result] = await db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
  return { id: result.insertId, ...user };
};

// Update a user by ID
const updateUser = async (id, user) => {
  const { name, email } = user;
  await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  return { id, ...user };
};

// Delete a user by ID
const deleteUser = async (id) => {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
  return { message: `User with ID ${id} deleted successfully` };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
