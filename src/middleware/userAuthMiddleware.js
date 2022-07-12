const jwt =require("jsonwebtoken");
const ObjectId= require('mongoose').Types.ObjectId
const bookModel = require("../model/bookModel")
//const userModel = require("../model/userModel")


const authentication = async function (req, res, next) {

    try {
        // check if token key is present in the header/cookies
        let token = req.headers["x-api-key"];
        // if (!token) token = req.headers["x-api-key"]; //convert key to small case because it will only accept smallcase
        if(!token){
            return res.status(400).send({ status: false, msg: "Token is Missing" });
        }
        
        // Checking if the token is creted using the secret key provided and decode it.
        let decodedToken = jwt.verify(token, "group30-radon");

        if (!decodedToken)
            return res.status(401).send({ status: false, msg: "Authentication Missing. Login is required. Token is invalid" }); 

       
            next()
        
    }
    catch (err) {
        res.status(500).send({ msg: "Serverside Errors. Please try again later", error: err.message })
    }

}

const authorisation = async function (req, res, next) {

    try {
        let token = req.headers["x-api-key"];
        if(!token){
            return res.status(400).send({ status: false, msg: "Token is Missing" });
        }
        let decodedToken = jwt.verify(token, "group30-radon");

        if (!decodedToken)
            return res.status(401).send({ status: false, msg: "Authentication Missing. Login is required. Token is invalid" }); 

       
        
          // execute if req.body will contain userID (When new Book is Created)
          if (req.body.userId) {
            //console.log(req.body.userId)
            if (decodedToken.userId != (req.body.userId)) {
                return res.status(400).send({ status: false, msg: "token userid and req.body id is not matched" })
            }
            return next()
        }
        // executes when we need to fetch the userId from bookID (when UPADTE API CAlls)
        if (req.params.bookId) {
            let bookId = req.params.bookId
            //check the user Id is Valid or Not ?
            if (!ObjectId.isValid(bookId)) {
                return res.status(400).send({ status: false, msg: "BookId in url: is Invalid" });
            }
            let userData = await bookModel.findById({_id:bookId}).select("userId")
    
            if(!userData){
                return res.status(404).send({ status: false, msg: "Book Id is not present in db" });
            }
            
            if (decodedToken.userId != userData.userId) {
                return res.status(400).send({ status: false, msg: "token user id and req.body id is not matched require authorization" })
            }
            return next()
        }
        //executes when we need userID from query params, (when UPDATE with Query Param filter)
        if (req.query.userId ) {
            if (decodedToken.userId != (req.query.userId)) {
                return res.status(400).send({ status: false, msg: "token userid and req.query id is not matched" })
            }
            return next()
        }
        
        //if no Author Id is Found from client Api ,Side
        else {
            return res.status(400).send({ status: false, mg: " user id Must be Present ......." })
        }
        
    }

    catch (err) {
        res.status(500).send({ msg: "Serverside Errors. Please try again later", error: err.message })
    }

}





module.exports.authentication = authentication
module.exports.authorisation = authorisation