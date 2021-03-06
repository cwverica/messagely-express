const express = require('express');
const router = new express.Router();
const { User } = require('../models/user');
const { Message } = require('../models/message');
const ExpressError = require('../expressError')
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth')

//TODO: Figure out this bloody mess
// It probably involves more authentication functions


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
        const { to_username, body } = req.body;
        const from_username = req.user.username;
        const message = await Message.create({ from_username, to_username, body });
        return { message }
    } catch (e) {
        return next(e);
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", async function (req, res, next) {
    try {

        Message.markRead(req.params.id)

    } catch (e) {
        return next(e);
    }

});