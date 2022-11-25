const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const activity = new Schema({
  id: {
    type: mongoose.Types.ObjectId,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  title: {
    type: String,
    required: [true, "Preparation Title is required"],
  },
  type: {
    type: String,
  },
  activity_details: {
    type: String,
  },
  resource: [{ type: Schema.Types.ObjectId, ref: "Resourse" }],
  interaction_time: {
    type: Number,
  },
  assessment: {
    type: String,
    default: null,
  },
  clock_hour: {
    type: Boolean,
    default: false,
  },

  time: { type: Date, default: Date.now },
});
activity.pre("save", function (next) {
  this.id = this._id;
  next();
});

module.exports = mongoose.model("Activity", activity);
