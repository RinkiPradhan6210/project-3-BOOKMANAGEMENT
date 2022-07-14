const userModel = require("../model/userModel");
//const bookModel=require("../model/bookModel");
const validator = require("email-validator")
const jwt = require("jsonwebtoken")



const userRegistartion = async function (req, res) {
  try {
    let userData = req.body
    let { title, name, phone, email, password, address, street, city, pincode, ...rest } = req.body
    //check if the data in request body is present or not ?
    if (!Object.keys(userData).length) return res.status(400).send({ status: false, message: "Please Enter the Data in Request Body" })
    //check if any unwanted keys present or not
    if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: "Please Enter the Valid Attribute Field " })
    //check  title is present or not
    if (!title) return res.status(400).send({ status: false, message: " Please Enter titile" })
    //check  name is present or not
    if (!name) return res.status(400).send({ status: false, message: " Please Enter name" })
    //check phone is present or not
    if (!phone) return res.status(400).send({ status: false, message: " Please Enter phone" })
    //check email is present or not
    if (!email) return res.status(400).send({ status: false, message: " Please Enter email" })
    // check password is present or not
    if (!password) return res.status(400).send({ status: false, message: "please Enter password" })
    // check title is valid or not
    if (!(["Mr", "Mrs", "Miss"].includes(title))) return res.status(400).send({ status: false, message: "title should be Mr,Mrs,Miss" })

    // check name is valid or not
    // var regName = /^[a-zA-Z]+$/;
    var regName = /^[a-zA-Z ]{2,30}$/
    if (!regName.test(name)) return res.status(400).send({ status: false, message: "name is invalid" })
    // check phone is valid indian number or not
    var regPhone = /^[6789]\d{9}$/;
    if (!regPhone.test(phone)) return res.status(400).send({ status: false, message: "phone is invalid" })

    //check email is valid or not
    if (!(validator.validate(email))) return res.status(400).send({ status: false, message: "email is invalid" })

    //check password is valid or not
    var passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    if (!passwordReg.test(password)) return res.status(400).send({ status: false, message: "password is invalid" })

    //chech phone is unique or not
    let uniquePhone = await userModel.findOne({ phone: phone })
    if (uniquePhone) return res.status(400).send({ status: false, message: "phone is already present in DB" })

    //check the email is unique 
    let uniqueEmail = await userModel.findOne({ email: email })
    if (uniqueEmail) return res.status(400).send({ status: false, msg: "E-mail is Already Present in DB" })
    //chech password is unique or not
    let uniquePass = await userModel.findOne({ password: password })
    if (uniquePass) return res.status(400).send({ status: false, message: "password is already present in DB" })


    if (address) {
      if (Array.isArray(address)) return res.status(400).send({ status: false, message: "address must be object" })
      //check street,city and pincode is present or not
      if (!address.street || !address.city || !address.pincode)
        return res.status(400).send({ status: false, msg: " please enter street,city,pincode" })
      //check street is valid or not
      if (!/^[a-zA-Z]+/.test(address.street)) return res.status(400).send({ status: false, msg: "strees is invalid" })
      //check city  is valid or not
      if (!/^[a-zA-Z]{2,30}$/.test(address.city)) return res.status(400).send({ status: false, msg: "city is invalid" })
      //check pincode  is valid or not
      if (!/^[1-9][0-9]{5}$/.test(address.pincode)) return res.status(400).send({ status: false, msg: "pincode is invalid" })
    }
    // add user in data
    let data = await userModel.create(userData)
    return res.status(201).send({ status: true, message: "success", data: data })
  }
  catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }
}


const userLogin = async function (req, res) {
  try {
    let data = req.body;
    //check body is empty or not
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: 'request body cant be empty' })
    //check mail is presenet or not
    let userMail = req.body.email;
    if (!userMail) return res.status(400).send({ status: false, msg: 'please enter email' })
    //check mail is presenet or not
    let userPassword = req.body.password;
    if (!userPassword) return res.status(400).send({ status: false, msg: 'please enter password' })
    // find the object as per email & password
    let findUser = await userModel.findOne({ email: userMail, password: userPassword });

    if (!findUser) return res.status(404).send({ status: false, msg: 'no such user exists, invalid email or password ' })


   //create token
    let token = jwt.sign(
      {
        userId: findUser._id.toString(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
        userName: findUser.name,

      },
      "group30-radon"
    );
    res.setHeader("x-api-key", token);
    res.status(201).send({ status: true, msg: "Success", data: { token } });
  } catch (err) {
    res.status(500).send({ msg: "error", error: err.message });
  }
}

module.exports.userRegistartion = userRegistartion
module.exports.userLogin = userLogin;
