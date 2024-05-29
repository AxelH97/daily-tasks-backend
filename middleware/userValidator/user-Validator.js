import { body, validationResult } from "express-validator";

const userValidator = [
  body("email").isEmail().withMessage("Invalid email").notEmpty(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .notEmpty()
    .matches(/^[0-9a-zA-Z]+$/, "i")
    .withMessage("Password must contain letters and numbers only"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};
export { validate, userValidator };
