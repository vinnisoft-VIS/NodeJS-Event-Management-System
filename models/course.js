const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const course = new Schema({
  id: {
    type: mongoose.Types.ObjectId,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  program: {
    type: Schema.Types.ObjectId,
    ref: "Program",
  },
  code: {
    type: String,
    required: [true, "Course Code is required"],
  },
  title: {
    type: String,
    required: [true, "Course Title is required"],
  },
  description: {
    type: String,
  },
  length: {
    type: Number,
  },
  credit_hours: {
    type: Number,
  },
  time: { type: Date, default: Date.now },
});
course.pre("save", function (next) {
  this.id = this._id;
  next();
});

const courseOutcome = new Schema({
  id: {
    type: mongoose.Types.ObjectId,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  description: {
    type: String,
    required: [true, "Course outcome is required"],
  },
  plo_addressed: [{ type: Schema.Types.ObjectId, ref: "ProgramOutcome" }],
  time: { type: Date, default: Date.now },
});
courseOutcome.pre("save", function (next) {
  this.id = this._id;
  next();
});

const Course = mongoose.model("Course", course);
const CourseOutcome = mongoose.model("CourseOutcome", courseOutcome);

module.exports = { Course, CourseOutcome };
