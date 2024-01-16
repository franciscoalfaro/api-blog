const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const ProyectoSchema = Schema({
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
        type: String,
        required: true
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

ProyectoSchema.plugin(mongoosePaginate);

module.exports = model("Proyecto", ProyectoSchema, "proyectos");