// helpers/validation.js
const { body } = require('express-validator');

// Auth validations
const registerValidation = [
    body('fullName')
        .notEmpty()
        .withMessage('full Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('full Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// User validations
const createUserValidation = [
    body('fullName')
        .notEmpty()
        .withMessage('fullName is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('fullName must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('role')
        .optional()
        .isInt({ min: 0, max: 3 })
        .withMessage('Role must be between 0 and 3')
];

const updateUserValidation = [
    body('fullName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('fullName must be between 2 and 50 characters'),
    body('role')
        .optional()
        .isInt({ min: 0, max: 3 })
        .withMessage('Role must be between 0 and 3')
];

module.exports = {
    registerValidation,
    loginValidation,
    createUserValidation,
    updateUserValidation
};