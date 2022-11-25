const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const program = new Schema({
  id: {
    type: mongoose.Types.ObjectId,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Program name is required"],
  },
  school: {
    type: String,
  },
  department: {
    type: String,
  },
  time: { type: Date, default: Date.now },
});
program.pre("save", function (next) {
  this.id = this._id;
  next();
});

const programOutcome = new Schema({
  id: {
    type: mongoose.Types.ObjectId,
  },
  program: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
    required: [true, "Program outcome is required"],
  },
  time: { type: Date, default: Date.now },
});
programOutcome.pre("save", function (next) {
  this.id = this._id;
  next();
});

const Program = mongoose.model("Program", program);
const ProgramOutcome = mongoose.model("ProgramOutcome", programOutcome);

module.exports = { Program, ProgramOutcome };
