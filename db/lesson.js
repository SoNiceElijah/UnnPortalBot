
const mongoose = require('mongoose');

const model = {
    lid : Number,
    name : String,
    desc: String,
    attachments : [mongoose.Types.ObjectId],
    events: [mongoose.Types.ObjectId],
    comments: [mongoose.Types.ObjectId]
}

const schema = new mongoose.Schema(model);

schema.statics.findByVkid = function(id) {
    return this.findOne({vkid : id }).exec();
}

module.exports = mongoose.model('lesson',schema);