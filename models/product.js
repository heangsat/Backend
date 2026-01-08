import mongoose from "mongoose";

const productScema = new mongoose.Schema({
   name: {
        type: String, 
        required: true, 
        trim: true,
    },
    price: {
        type: Number,
        required: true, 
        min: 0,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String, // URL to the image
        required: true,
    },
    available: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const productItem = mongoose.model('productItem',productScema);
export default productItem;