// models/Club.js
const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: String,
  role: String,
  image: String,
});

const eventSchema = new mongoose.Schema({
  event_name: String,
  event_date: Date,
  event_details: String,
  event_poster: String,
  event_detailedDescription: String,
});

const clubSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  club_message: String,
  club_poster: String,
  club_logo: String,
  pi_name: String,
  pi_message: String,
  pi_linkedIn: String,
  pi_image: String,
  about: [String],
  gallery: [String],
  members: [memberSchema],
  events: [eventSchema],
  social_links: {
    facebook: String,
    twitter: String,
    instagram: String,
  },
});

module.exports = mongoose.model("Club", clubSchema);
