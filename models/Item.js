import mongoose, { Types }  from "mongoose";

//define the schema
const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: false
    }
});
const Item = mongoose.model('Item',ItemSchema);
export default Item;
