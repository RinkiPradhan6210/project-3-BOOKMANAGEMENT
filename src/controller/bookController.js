const bookModel = require("../model/bookModel")
const userModel = require("../model/userModel")
const reviewModel = require("../model/reviewModel")
const ObjectId = require('mongoose').Types.ObjectId
const moment = require('moment')

const createBook = async function (req, res) {
    try {
        //let books = req.params.books
        let reqBody = req.body
        let { userId, title, excerpt, ISBN, category, subCategory, reviews, releasedAt, ...rest } = req.body
        
        // check body is empty or not
        if (!Object.keys(reqBody).length) return res.status(400).send({ status: false, message: "Please Enter the Data in Request Body" })
        //check if any unwanted keys present or not
        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: "Please Enter the Valid Attribute Field " })
        //check  userId is present or not
        if (!userId) return res.status(400).send({ status: false, message: "Please Enter userId" })
        //check title is present or not
        if (!title) return res.status(400).send({ status: false, message: "Please Enter title" })
        //check excerpt is present or not
        if (!excerpt) return res.status(400).send({ status: false, message: "Please Enter excerpt" })
        //check ISBN is present or not
        if (!ISBN) return res.status(400).send({ status: false, message: "Please Enter ISBN" })
        //check category is present or not
        if (!category) return res.status(400).send({ status: false, message: "Please Enter category" })
        //check title is present or not
        if (!subCategory) return res.status(400).send({ status: false, message: "Please Enter subCategory" })
        //check releasedAt is present or not
        if (!releasedAt) return res.status(400).send({ status: false, message: "Please Enter releasedAt" })
        //check title is valid or not
        let regName = /^[a-zA-Z ]+/
        if (!regName.test(title)) return res.status(400).send({ status: false, message: "title is invalid" })

        //check excerpt is valid or not
        if (!regName.test(excerpt)) return res.status(400).send({ status: false, message: "excerpt is invalid" })
        //check ISBN is valid or not
        let ISBNreg = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
        if (!ISBNreg.test(ISBN)) return res.status(400).send({ status: false, message: "ISBN is invalid" })
        //check category is valid or not
        if (!regName.test(category)) return res.status(400).send({ status: false, message: "category is invalid" })
        //check subCategory is valid or not
        if (!regName.test(subCategory)) return res.status(400).send({ status: false, message: "subCategory is invalid" })
        //check userId is valid or not
        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "userid is invalid" })
        //check userId is present or not in db
        let checkUserId = await userModel.findById({ _id: userId, isDeleted: false })
        if (!checkUserId) return res.status(400).send({ status: false, message: "userid is not present in db" })
        //check title is qinque
        let checktitle = await bookModel.findOne({ title: title })
        if (checktitle) return res.status(400).send({ status: false, message: "This title is already exist" })
        //console.log(checkISBN)
        //check ISBN is qunique 
        let checkISBN = await bookModel.findOne({ ISBN: ISBN })

        if (checkISBN) return res.status(400).send({ status: false, message: "This ISBN already exist" })
        //console.log(checkISBN)

        releasedAt = moment().format('YYYY-MM-DD ')
        releasedAt.reqBody = req.body
        let savedData = await bookModel.create(reqBody)
        res.status(201).send({ status: true, message: "Success", data: savedData })
  }
    catch (error) {
        return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: error.message })
  }
}


const getBooks = async function (req, res) {
    try {
        let filterData = req.query
        let { userId, category, subCategory, ...rest } = filterData
        //console.log(rest)
         if (Object.keys(rest).length > 0) {
            return res.status(400).send({ status: false, msg: " please provide valide filter key for ex. userId, category, subcategory only" })
        }

        //check if any quer parm is present ?
        if (Object.keys(req.query).length !== 0) {

            //check if id inquery is valid or not
            if (userId && (!ObjectId.isValid(userId))) {
                return res.status(400).send({ status: false, msg: "invalid userId in query params" })
            }
             //add the keyisDeleted 
            req.query.isDeleted = false
           //find data as per req.query para filter ?
            let data = await bookModel.find(req.query)
          //check if data is found or not ?
            if (data.length != 0) return res.status(200).send({ status: true, data: data })
            return res.status(404).send({ status: false, msg: "No Document Found as per filter key " })
        }

        //return the data ony if isDeleted :false 
        let data = await bookModel.find({ isDeleted: false }).sort({ title: 1 }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        if (data.length != 0) return res.status(200).send({ status: true, data: data })

        //return res.status(404).send({ status: false, msg: "No documents are found" })


    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}
let getBooksById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        bookId.isDeleted = false
        //check bookId is valid or not
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "invalid bookid" })
        //check bookId is present or not in DB
        let checkBook = await bookModel.findById(bookId)
        if (!checkBook) return res.status(404).send({ status: false, message: "book is not present in DB" })
        //check if the book isDeleted or not
        if (checkBook.isDeleted == true) return res.status(404).send({ status: false, message: "the book is already deleted" })

        //Check reviews
        let reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, review: 1, rating: 1 });
        //check document is available or not
        if (!reviewsData) return res.status(404).send({ status: false, message: "No document is found" })
        // destructure
        let { _id, title, excerpt, userId, category, subCategory, isDeleted, reviews, releasedAt, createdAt, updatedAt } = checkBook

        //fetch tha data
        let data = { _id, title, excerpt, userId, category, subCategory, isDeleted, reviews, releasedAt, createdAt, updatedAt, reviewsData }
        return res.status(200).send({ status: true, message: "Books list", data: data })
    }
    catch (error) {
        return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: error.message })

    }
}

const updateBooks = async function (req, res) {
    try {
        // Stores the blog id data recieved in params in to a new variable
        let enteredBookId = req.params.bookId
        let data = req.body
        let { title, excerpt, releasedAt, ISBN, isDeleted, ...rest } = data


        //check if body is empty or not
        if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "provide some data in param" })

        //check if any unwanted keys is present or not
        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: "please provide valid attribute" })

        //check title is valid or not
        //if(!isValid(data.title)) return res.status(400).send({status: false, message: "Please Enter title"})
        let regName = /^[a-zA-Z ]+/
        if (!regName.test(title)) return res.status(400).send({ status: false, message: "title is invalid" })
        //check encerpt is valid or not
        //if(!isValid(data.excerpt)) return res.status(400).send({status: false, message: "Please Enter excerpt"})

        if (!regName.test(excerpt)) return res.status(400).send({ status: false, message: "title is invalid" })
        //check ISBN is valid or not
         let ISBNreg = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
         if (!ISBNreg.test(ISBN)) return res.status(400).send({ status: false, message: "ISBN is invalid" })
         // check book is present or not
        let checkBookId = await bookModel.findById(enteredBookId)
        if (!checkBookId) return res.status(404).send({ status: false, message: "This book does not exist" })
        // check book is alredy deleted or not
        if (checkBookId.isDeleted)
            return res.status(404).send({ status: false, message: "This Book is already Deleted" })
        // check unique ISBN
        let checkISBN = await bookModel.findOne({ ISBN: ISBN })
        if (checkISBN) return res.status(400).send({ status: false, message: "This ISBN already exist" })
        //console.log(checkISBN)
        //check unique title 
        let checktitle = await bookModel.findOne({ title: title })
        if (checktitle) return res.status(400).send({ status: false, message: "This title is already exist" })

       // update data
        let updateData = await bookModel.findByIdAndUpdate(enteredBookId, {
            title, excerpt, releasedAt, ISBN
        }, { new: true })

        return res.status(200).send({ status: true, message: "success", data: updateData })

    }
    catch (err) {
        return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: err.message })
    }
}

const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let deletedAt = Date.now('YYYY/MM/DD:mm:ss')
        //let update = { isDeleted: true, deletedAt: time }

        let book = await bookModel.findById(bookId) 
        //check if isDeleated Status is True
        if (book.isDeleted == true) return res.status(404).send({ status: false, message: "the book is already deleted" })
        //update the status of isDeleted to TRUE
        let updatedData = await bookModel.findOneAndUpdate({ _id: bookId },{isDeleted: false }, deletedAt, { new: true });
        return res.status(200).send({ status: true, msg: "successfuly Deleted" });
    }
    catch (error) {
        return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: error.message })

    }

}



module.exports.createBook = createBook
module.exports.getBooks = getBooks
module.exports.getBooksById = getBooksById
module.exports.deleteBook = deleteBook
module.exports.updateBooks = updateBooks

// const arry=[1,2,3,12,23]
// console.log(arry.sort((a,b)=>b-a))







