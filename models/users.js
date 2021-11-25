let mongoose = require("mongoose");
const PassportLocalMongoose = require("passport-local-mongoose");
let Schema = mongoose.Schema;

let User = new Schema({
  admin: {
    type: Boolean,
    default: false,
  },
});

User.plugin(PassportLocalMongoose);

module.exports = mongoose.model("User", User);
