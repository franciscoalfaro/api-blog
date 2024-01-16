const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const CategoriaSchema = Schema({
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

CategoriaSchema.plugin(mongoosePaginate);

module.exports = model("Categoria", CategoriaSchema, "categorias");
