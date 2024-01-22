const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const RedesSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    valor: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

RedesSchema.plugin(mongoosePaginate);

module.exports = model("Redes", RedesSchema, "redes");
