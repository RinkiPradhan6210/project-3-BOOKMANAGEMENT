const mongoose=require("mongoose");
const ObjectId= mongoose.Schema.Types.ObjectId;
const bookSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    excerpt:{
        type :String,
        required:true
    },
    ISBN:{
        type:String,
        required:true,
        unique:true

    },
    userId:{
        type:ObjectId,
        ref:"User",
        required:true,
        trim:true
    },
    category:{
        type:String,
        required:true,
        trim:true
    },
    subCategory:{
        type:[String],
        required:true,
        trim:true
    },
    reviews:{
        type:Number,
        default:0 ,
        trim : true
    },
    deletedAt:{
        type:Date,
        trim:true
    },
    isDeleted:{
        type:Boolean,
        default:false,
        trim:true
    },
    releasedAt:{
        type:Date,
        default : Date.now ,
        required:true
    },    
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema)

