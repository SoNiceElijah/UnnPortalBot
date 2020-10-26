
const mongoose = require('mongoose');

const model = {
    vkid : Number,
    gid : Number,
    gname : String,
    lng : { type: Number, default: 1 }
}

const schema = new mongoose.Schema(model);

schema.statics.findByVkid = function(id) {
    return this.findOne({vkid : id }).exec();
}

module.exports = mongoose.model('user',schema);