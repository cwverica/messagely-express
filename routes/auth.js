const express = require("express");
const router = new express.Router();
const { User } = require('../models/user');
const { SECRET_KEY } = require('../config');

const ExpressError = require("../expressError")

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
    try {
        const { username, password } = req.body;
        if (await User.authenticate(username, password)) {
            User.updateLoginTimestamp(username);
            let token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token });
        }
        throw new ExpressError("Invalid user/password", 400);
    } catch (e) {
        return next(e);
    }
});



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        await User.register({ username, password, first_name, last_name, phone });
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    } catch (e) {
        throw new ExpressError("Username taken", 400);
    }
});