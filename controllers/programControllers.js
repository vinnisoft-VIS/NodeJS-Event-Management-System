const { ObjectId } = require("mongodb");
const { success, error } = require("../utils/response");
const { Program, ProgramOutcome } = require("../models/program");

const router = {};
router.get = async (req, res) => {
  try {
    let user = req.decoded.userId;
    let program = await Program.aggregate([
      { $match: { user: ObjectId(user) } },
      {
        $lookup: {
          from: ProgramOutcome.collection.name,
          localField: "_id",
          foreignField: "program",
          pipeline: [
            {
              $project: {
                _id: true,
                id: true,
                description: true,
              },
            },
          ],
          as: "outcomes",
        },
      },
      {
        $project: {
          name: true,
          school: true,
          department: true,
          _id: true,
          id: true,
          outcomes: true,
        },
      },
    ]);

    return res.status(200).json(await success("All Programs", program));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.getOne = async (req, res) => {
  try {
    let user = req.decoded.userId;
    let programId = req.params.programId;
    let program = await Program.aggregate([
      { $match: { _id: ObjectId(programId) } },
      {
        $lookup: {
          from: ProgramOutcome.collection.name,
          localField: "_id",
          foreignField: "program",
          pipeline: [
            {
              $project: {
                _id: true,
                id: true,
                description: true,
              },
            },
          ],
          as: "outcomes",
        },
      },
      {
        $project: {
          name: true,
          school: true,
          department: true,
          _id: true,
          id: true,
          outcomes: true,
        },
      },
    ]);

    return res.status(200).json(await success("Program Info", program[0]));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.post = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let obj = req.body;

    let program = await Program.create({ ...obj, user: userId });
    program = JSON.parse(JSON.stringify(program));
    let outcomes = obj.outcomes.map((item) => ({
      ...item,
      program: program._id,
    }));

    let programOutcome = await ProgramOutcome.create(outcomes);
    program.outcomes = programOutcome;

    return res.status(200).json(await success("Program Added", program));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.update = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let programId = req.params.programId;
    let obj = req.body;
    let { outcomes } = obj;
    let program = await Program.findOneAndUpdate(
      {
        _id: programId,
        user: userId,
      },
      obj,
      { new: true }
    ).lean();
    let id_s = [];
    let results = await Promise.all(
      outcomes.map(async (item) => {
        if (item._id) {
          let obj = await ProgramOutcome.findOneAndUpdate(
            { _id: item._id, program: programId },
            item,
            { new: true }
          );
          id_s.push(obj._id);
          return obj;
        } else {
          let obj = await ProgramOutcome.create({
            program: programId,
            ...item,
          });
          id_s.push(obj._id);
          return obj;
        }
      })
    );
    let deleted = await ProgramOutcome.deleteMany({
      program: programId,
      _id: { $nin: id_s },
    });
    program.outcomes = results;
    return res.status(200).json(await success("Program Updated", program));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.delete = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let programId = req.params.programId;
    let deleted = await Program.deleteOne({
      _id: programId,
      user: userId,
    });
    if (deleted.deletedCount) {
      let deleted1 = await ProgramOutcome.deleteMany({
        program: programId,
      });
    }
    return res.status(200).json(await success("Program Deleted", deleted));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};

module.exports = router;
