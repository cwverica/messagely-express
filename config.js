/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

let DB_URI;
const MY_DB_USER = process.env.MY_DB_USER;
const MY_DB_PW = process.env.MY_DB_PW;

if (MY_DB_USER) {
  DB_URI = (process.env.NODE_ENV === "test")
    ? `postgresql://${MY_DB_USER}:${MY_DB_PW}@localHost:5432/messagely_test`
    : `postgresql://${MY_DB_USER}:${MY_DB_PW}@localHost:5432/messagely`;
} else {
  DB_URI = (process.env.NODE_ENV === "test")
    ? "postgresql:///messagely_test"
    : "postgresql:///messagely";
}

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};