/** User class for message.ly */

const db = require('../db');
const { BCRYPT_WORK_FACTOR } = require("../config");
const b = require('bcrypt');
const ExpressError = require("../expressError");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    try {
      const hashedPassword = await b.hash(
        password, BCRYPT_WORK_FACTOR);
      const result = await db.query(
        `INSERT INTO users (
            username,
            password,
            first_name,
            last_name,
            phone,
            join_at,
            last_login_at
            )
          VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
          RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone]);
      return result.rows[0];
    } catch (e) {
      return new ExpressError("Username already taken", 400);
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const result = await db.query(
        `SELECT password
         FROM users
         WHERE username=$1`,
        [username]);

      const user = result.rows[0];
      if (user) {
        if (await b.compare(password, user.password) === true) {
          return true;
        }
      }
      return false;

    } catch (e) {
      return e;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const result = await db.query(
        `UPDATE users
         SET last_login_at = current_timestamp
         WHERE username=$1
         RETURNING username`,
        [username]);
      const user = result.rows[0];
      if (!user.username === username) {
        throw new ExpressError("Invalid username", 400)
      }
    } catch (e) {
      return e;
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    try {
      const results = await db.query(
        `SELECT username, first_name, last_name, phone
         FROM users`,);

      return results.rows;

    } catch (e) {
      return e;
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    try {
      const result = await db.query(
        `SELECT username, first_name, last_name, phone, join_at, last_login_at
         FROM users
         WHERE username=$1`,
        [username]);
      const user = result.rows[0];
      if (!user.username === username) {
        throw new ExpressError("Invalid username", 400)
      }
      return user;

    } catch (e) {
      return e;
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    try {
      await User.get(username);
      const results = await db.query(
        `SELECT m.id,
         m.to_username as username,
         t.first_name AS first_name,
         t.last_name AS last_name,
         t.phone AS phone,
         m.body,
         m.sent_at,
         m.read_at
         FROM messages AS m
           JOIN users AS t ON m.to_username = t.username
         WHERE m.from_username = $1`,
        [username]);

      if (results.rows.length === 0) {
        return results.rows;
      }
      const fromUserMessages = results.rows.map(row => {
        const to_user = {};
        to_user.username = row.username;
        to_user.first_name = row.first_name;
        to_user.last_name = row.last_name;
        to_user.phone = row.phone;
        delete row.username, row.first_name, row.last_name, row.phone;
        row.to_user = { ...to_user }

      });

      return fromUserMessages;

    } catch (e) {
      return e;
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    try {
      await User.get(username);
      const results = await db.query(
        `SELECT m.id,
         m.from_username as username,
         f.first_name AS first_name,
         f.last_name AS last_name,
         f.phone AS phone,
         m.body,
         m.sent_at,
         m.read_at
         FROM messages AS m
           JOIN users AS f ON m.from_username = f.username
         WHERE m.to_username = $1`,
        [username]);

      if (results.rows.length === 0) {
        return results.rows;
      }
      const toUserMessages = results.rows.map(row => {
        const from_user = {};
        from_user.username = row.username;
        from_user.first_name = row.first_name;
        from_user.last_name = row.last_name;
        from_user.phone = row.phone;
        delete row.username, row.first_name, row.last_name, row.phone;
        row.from_user = { ...from_user }
      });

      return toUserMessages;

    } catch (e) {
      return e;
    }
  }
}


module.exports = User;