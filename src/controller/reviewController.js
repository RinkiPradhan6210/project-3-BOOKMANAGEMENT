const bookModel = require("../model/bookModel")
//const userModel = require("../model/userModel")
const reviewModel = require("../model/reviewModel")
const ObjectId = require('mongoose').Types.ObjectId
//const moment = require('moment')

const reviews = async function (req, res) {
  try {
      let reviewsData = req.body
      let { bookId } = req.params
      let { reviewedBy, rating, review,reviewedAt,isDeleted,  ...rest } = req.body
   
      //check body is empty or not
    if (!Object.keys(reviewsData).length) return res.status(400).send({ status: false, message: "Please Enter the Data in Request Body" })
    //check if any unwanted keys present or 
    if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: "Please Enter the Valid Attribute Field " })
    //check bookid is present or not
    if (!bookId) return res.status(400).send({ status: false, message: "please enter bookId in params" })
    //check if rating is present or not ie req.body
     if (!rating) return res.status(400).send({ status: false, message: "please enter rating" })
    //check the bookId is Valid or Not ?
    if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: "bookId is Invalid" });
    //check  reviewedBy is valid or not
     //let regName=/^[a-zA-Z]$/
    if (!/^[a-zA-Z]{2,30}$/.test(reviewedBy)) return res.status(400).send({ status: false, msg: "reviewedBy is Invalid" });
    
    //check  rating is valid or not
    if(!(rating >= 1 && rating <= 5)) return res.status(400).send({ status: false, msg: "rating should be between 1 to 5" });

    // check  review is valid or not
    if (!/^[a-zA-Z]+/.test(review)) return res.status(400).send({ status: false, msg: "review is Invalid" });
      //check if isDeleted is TRUE/FALSE ?
      if (isDeleted && (!(typeof isDeleted === "boolean"))) {
          return res.status(400).send({ status: false, msg: "isDeleted Must be TRUE OR FALSE" });
      }
      //  if isDeleted is true add the current Time&Date in deletedAt?
      if (isDeleted) {
          bookData.deletedAt = new Date()
      }
     //check bookId is present or not in DB
     let findBook = await bookModel.findOne({ bookId: bookId, isDeleted: false })
    if (!findBook) return res.status(404).send({ status: false, message: "book is not present in DB" })

    req.body.reviewedAt = new Date();
    
      //reviewedAt.reqBody = req.body
      req.body.bookId = bookId.toString()

      // if all condition are passed then data will be create
      const savedData = await reviewModel.create(req.body)
      
      const reviewData = await reviewModel
      .findById(savedData. _id)
      .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 });

      
      let updatedBook = await bookModel.findByIdAndUpdate(bookId, { $inc: { reviews: 1  } }, { new: true }).lean()

      updatedBook.reviewData = reviewData
      
      return res.status(201).send({ status: true, message: "Success", data:updatedBook  })

  } catch (error) {
      return res.status(500).send({ status: false, msg: error.message })
  }
}

const updateReview = async function (req, res) {
  try {
    // Stores the blog id data recieved in params in to a new variable
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;
    let newData = req.body;
    let { reviewedBy, rating, review, ...rest } = newData;//destructure
    //check bookId is present or not in params
    if (!Object.keys(bookId).length) return res.status(400).send({ status: false, message: "Please Enter some bookId in params" })
    //check reviewedId is present or not in params
    if (!Object.keys(reviewId).length) return res.status(400).send({ status: false, message: "Please Enter some reviewId in params" })
    // check body is empty or not
    if (!Object.keys(req.body).length) return res.status(400).send({ status: false, message: "Please Enter the Data in Request Body" })
    // check params is empty or not
    if (!Object.keys(req.params).length) return res.status(400).send({ status: false, message: "Please Enter the Data in params" })
    //check reviewedBy is valid or present or not 
    if (!/^[a-zA-Z]+/.test(reviewedBy)) return res.status(400).send({ status: false, msg: "reviewBy should be in alphabets" })
    //check reviewe is valid or present or not 
    if  (!/^[a-zA-Z]+/.test(review)) return res.status(400).send({ status: false, msg: "review should be in letters" }) 
    //check rating is valid or present or not 
    if  (!/^[1-5]$/.test(rating)) return res.status(400).send({ status: false, msg: "rating should be between 1 and 5" })
    //check any unwanted key is present in body or not 
    if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: "Only reviewedBy or rating or review can be updated" })
    //check bookid is valid or not
    if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: "bookid is invalid" })
    // check review id is valid or not 
    if (!ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, msg: "reviewid is invalid" })
    // check book is present in our DB or not or deleted
    let findBook = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!findBook) return res.status(404).send({ status: false, msg: "No such book exists or is deleted" })
    ////check review is present in DB or presen not 
    let findReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
    if (!findReview) return res.status(404).send({ status: false, msg: "No such review exists or is deleted" })
   // check findReview.bookId or params bookId is equal or not
    if (findReview.bookId != bookId) return res.status(400).send({ status: false, msg: "the review doesnt belong to this book or vice versa,change the given id" })
   // update book
    let updateData = await reviewModel.findByIdAndUpdate(reviewId, {
      review: review,
      rating: rating,
      reviewedBy: reviewedBy,

    }, { new: true })
    return res.status(200).send({ status: true, msg: "Success", data: updateData })

  }
  catch (err) {
    return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: err.message })
  }
}
const deleteReview = async function (req, res) {
  try {
    let bookId = req.params.bookId
    let reviewId = req.params.reviewId
    let deletedAt = Date.now('YYYY/MM/DD:mm:ss')
    //check bookId is valid or not
    if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Bookid is invalid" })
    //check bookId is valid or not
    if (!ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: "reviewId is not valid" })
    //check bookId is present in DB or not
    let book = await bookModel.findById(bookId)
    if (!book) return res.status(404).send({ status: false, message: "Book is not present in DB" })
    // check book is already deleted or not
    if (book.isDeleted == true) return res.status(404).send({ status: false, message: "the book is already deleted" })
    //check reviewId is present in DB  or not
    let review = await reviewModel.findById(reviewId)
    //console.log(review)
   
    if (!review) return res.status(400).send({ status: false, message: "No review found for this book" })
   // check review is already deleted or not
    if (review.isDeleted == true) return res.status(404).send({ status: false, message: "This review is already Deleted." })
   // checking review.bookId or params id is matched or not
    if (review.bookId != bookId) return res.status(400).send({ status: false, message: "the review doesnt belong to this book or vice versa,change the given id" })
   
    //update the status of isDeleted to TRUE
    let updatedData = await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true }, deletedAt,{ new: true });
    book.reviews--;
    await book.save();

    return res.status(200).send({ status: true, msg: "Successfuly Deleted" });
  }
  catch (error) {
    return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: error.message })

  }

}

module.exports.reviews = reviews
module.exports.updateReview = updateReview
module.exports.deleteReview = deleteReview