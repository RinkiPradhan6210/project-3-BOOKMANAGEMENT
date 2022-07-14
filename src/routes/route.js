const express = require('express');
const router = express.Router();
const userController=require("../controller/userController")
const bookController=require("../controller/bookController")
const middleware = require("../middleware/userAuthMiddleware")
const reviewController=require("../controller/reviewController")
//APIS for user
router.post("/register", userController.userRegistartion)//testing done

router.post("/login", userController.userLogin)//testing done

//APIS for Book
router.post("/books" , middleware.authentication , middleware.authorisation, bookController.createBook)//done

router.get("/books",middleware.authentication, bookController.getBooks)//testing done

router.get("/books/:bookId",middleware.authentication, bookController.getBooksById)//testing done

router.put("/books/:bookId" , middleware.authentication  , middleware.authorisation, bookController.updateBooks)//done

router.delete("/books/:bookId" , middleware.authentication  , middleware.authorisation, bookController.deleteBook)//done

//APIS for reviews
router.post("/books/:bookId/review", reviewController.reviews)//testing done

router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)//testing done

router.delete("/books/:bookId/review/:reviewId" , reviewController.deleteReview)//testing done






module.exports=router;
