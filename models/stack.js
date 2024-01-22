const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const StackSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type:String
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

StackSchema.plugin(mongoosePaginate);

module.exports = model("Stack", StackSchema, "stacks");
