const express = require('express')
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

router.post(
  '/',
  validateSignup,
  async (req, res) => {
    const { email, password, username } = req.body;
    const user = await User.signup({ email, username, password });

    await setTokenCookie(res, user);

    return res.json({
      user: user
    });
  }
);

//My code here
//-------------------------------------------------------------------
//README.md file on 87 Line 
//### Log In a User 
//Sign Up a User
//Logs in a current user with valid credentials 
//and returns the current user's information.
//-------------------------------------------------------------------
router.post('/login',
  async (req, res) => {

    let errorResult = { message: 'Validation error', statusCode: 400, errors: [] };

    const { credential, password } = req.body;

    //check input validity
    if (!(credential)) {
      errorResult.errors.push('Email or username is required');
    }
    if (!(password)) {
      errorResult.errors.push('Password is required');
    }
    if (errorResult.errors.length > 0) {
      res.status(400);
      return res.json(errorResult);
    }

    // login
    const user = await User.login({ credential, password });

    if (user) {
      await setTokenCookie(res, user);

      res.status(200);
      return res.json({
        user: user
      });
    }
    else { // Invalid credentials
      res.status(401);
      res.send({
        message: 'Invalid credentials',
        statusCode: 401
      });
    }

  });

//-------------------------------------------------------------------
//README.md file on 156 Line 
//### Sign Up a User 
//Creates a new user, logs them in as the current user, 
//and returns the current user's information.
//-------------------------------------------------------------------
router.post(
  '/Signup',
  validateSignup,
  async (req, res) => {
    let errorValidity = { message: 'Validation error', statusCode: 400, errors: ["User with that email already exists"] };
    let errorUserAlreadyExist = { message: 'User already exists', statusCode: 403, errors: [] };


    const { firstName, lastName, email, username, password } = req.body;

    //check input validity
    if (!(email)) {
      errorValidity.errors.push('Invalid email');
    }
    if (!(username)) {
      errorValidity.errors.push('Username is required');
    }
    if (!(firstName)) {
      errorValidity.errors.push('First Name is required');
    }
    if (!(lastName)) {
      errorValidity.errors.push('Last Name is required');
    }

    if (errorValidity.errors.length > 0) {
      res.status(400);
      return res.json(errorValidity);
    }

    //check User already exists validity by name
    const existuser1 = await User.findOne({
      where: {
        username: username,
      }
    });

    if (existuser1) {
      errorUserAlreadyExist.errors.push('User with that username already exists');
      res.status(403);
      return res.json(errorUserAlreadyExist);
    }

    //check User already exists validity by email
    const existuser2 = await User.findOne({
      where: {
        email: email,
      }
    });

    if (existuser2) {
      errorUserAlreadyExist.errors.push('User with that email already exists');
      res.status(403);
      return res.json(errorUserAlreadyExist);
    }

    //OK now, create new 
    const user = await User.signup({ email, username, password });

    user.update(
      { firstName: firstName },
      { lastName: lastName },
    );

    await setTokenCookie(res, user);

    res.status(200);
    return res.json({
      user: user
    });

  });

router.get( '/Test',
async (req, res) => {
    res.status(200);
});
//end my code----------------------------------------------------------


module.exports = router;
