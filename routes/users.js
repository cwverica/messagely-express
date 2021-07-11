const express = require('express');
const router = new express.Router();
const { User } = require('../models/user');
const { Message } = require('../models/message');
const ExpressError = require('../expressError')
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth')

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
    try {
        const users = await User.all()
        return { users };
    } catch (e) {
        return next(e);
    }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const user = await User.get(req.user.username);
        return { user }
    } catch (e) {
        return next(e);
    }
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureCorrectUser, async function (req, res, next) {
    try {
        const messages = await User.messagesTo(req.user.usernam);
        return { messages }
    } catch (e) {
        return next(e);
    }
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', ensureCorrectUser, async function (req, res, next) {
    try {
        const messages = await User.messagesFrom(req.user.usernam);
        return { messages }
    } catch (e) {
        return next(e);
    }
});