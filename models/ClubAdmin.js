const mongoose = require("mongoose");
const { Schema } = mongoose;

const { clubSchema } = require('./Club');

const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  club: { type: Schema.Types.ObjectId, ref: "Club" },
});

const ClubAdmin = mongoose.model("ClubAdmin", adminSchema);

module.exports = ClubAdmin;