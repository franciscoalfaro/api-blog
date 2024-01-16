const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const ArticuloSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    titulo: {
        type: String,
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "Categoria"
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    imagen: {
        type: String,
        default: "default.png"
    }
});

ArticuloSchema.plugin(mongoosePaginate);

module.exports = model("Articulo", ArticuloSchema, "articulos");