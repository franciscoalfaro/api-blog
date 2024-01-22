const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const ContactoSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

ContactoSchema.plugin(mongoosePaginate);

module.exports = model("Contacto", ContactoSchema, "contactos");
