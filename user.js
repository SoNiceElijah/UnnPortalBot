
// Это дата маппер на самом деле
// Вот это неожиданно

const mongoose = require('mongoose');

const model = {
    vkid : Number,
    gid : Number,
    gname : String,
}

const schema = new mongoose.Schema(model);

schema.statics.findByVkid = function(id) {
    return this.findOne({vkid : id }).exec();
}

module.exports = mongoose.model('user',schema);