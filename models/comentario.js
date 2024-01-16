const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const ComentarioSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    articulo: {
        type: Schema.Types.ObjectId,
        ref: "Articulo"
    },
    comentario: {
        type: String,
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

ComentarioSchema.plugin(mongoosePaginate);

module.exports = model("Comentario", ComentarioSchema, "comentarios");
