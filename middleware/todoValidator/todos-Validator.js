import { body, validationResult } from "express-validator";

const toDoValidator = 
     [
      body('title').notEmpty().withMessage('Title is required').notEmpty(),
      body('completed').optional().isBoolean(),
];

    const validate = (req, res, next) => {

        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) {
          return  res.status(422).json({ errors: errors.array() });
        }
      next()
    
      };
      export {validate, toDoValidator}








