const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({ 
    
        bookId: {
            type: ObjectId,
            ref: "Book",
            required: true,
            trim:true
        },
        reviewedBy: {
            type: String,
            required: true,
            default: "Guest",
            trim:true
        },
        reviewedAt: {
            type: Date,
            required: true,
            trim:true
        },
        rating: {
            type: Number,
            required: true,
            trim:true
        },
        review: {
            type: String,
            trim:true,
            default:[], 
            min:1,
            max:5
        },
        isDeleted: {
            type: Boolean,
            default: false,
            trim:true
        },


    }, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema)
