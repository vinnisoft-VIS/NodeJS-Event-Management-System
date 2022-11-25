const { ObjectId } = require("mongodb");
const { success, error } = require("../utils/response");
const { Course, CourseOutcome } = require("../models/course");
const { Program, ProgramOutcome } = require("../models/program");

const router = {};
router.get = async (req, res) => {
  try {
    let user = req.decoded.userId;
    let course = await Course.aggregate([
      { $match: { user: ObjectId(user) } },
      {
        $lookup: {
          from: CourseOutcome.collection.name,
          localField: "_id",
          foreignField: "course",
          pipeline: [
            {
              $project: {
                _id: true,
                id: true,
                description: true,
                plo_addressed: true,
              },
            },
          ],
          as: "outcomes",
        },
      },
      {
        $lookup: {
          from: Program.collection.name,
          localField: "program",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: true,
                id: true,
                name: true,
                school: true,
                department: true,
              },
            },
          ],
          as: "program",
        },
      },
      {
        $addFields: {
          program: { $first: "$program" },
        },
      },
      {
        $project: {
          code: true,
          program: true,
          title: true,
          description: true,
          length: true,
          id: true,
          _id: true,
          outcomes: true,
        },
      },
    ]);

    return res.status(200).json(await success("All Courses", course));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.getOne = async (req, res) => {
  try {
    let user = req.decoded.userId;
    let courseId = req.params.courseId;
    let course = await Course.aggregate([
      { $match: { _id: ObjectId(courseId) } },
      {
        $lookup: {
          from: CourseOutcome.collection.name,
          localField: "_id",
          foreignField: "course",
          pipeline: [
            {
              $lookup: {
                from: ProgramOutcome.collection.name,
                localField: "plo_addressed",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: true,
                      id: true,
                      description: true,
                    },
                  },
                ],
                as: "plo_addressed",
              },
            },
            {
              $project: {
                _id: true,
                id: true,
                description: true,
                plo_addressed: true,
              },
            },
          ],
          as: "outcomes",
        },
      },
      {
        $lookup: {
          from: Program.collection.name,
          localField: "program",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: true,
                id: true,
                name: true,
                school: true,
                department: true,
              },
            },
          ],
          as: "program",
        },
      },
      {
        $addFields: {
          program: { $first: "$program" },
        },
      },
      {
        $project: {
          code: true,
          program: true,
          title: true,
          description: true,
          length: true,
          credit_hours: true,
          _id: true,
          id: true,
          outcomes: true,
        },
      },
    ]);

    return res.status(200).json(await success("All Courses", course[0]));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.post = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let obj = req.body;
    let course = await Course.create({ ...obj, user: userId });
    course = JSON.parse(JSON.stringify(course));
    let outcomes = obj.outcomes.map((item) => ({
      ...item,
      course: course._id,
    }));

    let courseOutcome = await CourseOutcome.create(outcomes);
    course.outcomes = courseOutcome;

    return res.status(200).json(await success("Course Added", course));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.update = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let courseId = req.params.courseId;
    let obj = req.body;
    let { outcomes } = obj;
    console.log(outcomes);
    let course = await Course.findOneAndUpdate(
      {
        _id: courseId,
        user: userId,
      },
      obj,
      { new: true }
    ).lean();
    let id_s = [];
    let results = [];
    if (outcomes) {
      results = await Promise.all(
        outcomes.map(async (item) => {
          if (item._id) {
            let obj = await CourseOutcome.findOneAndUpdate(
              { _id: item._id, course: courseId },
              item,
              { new: true }
            );
            id_s.push(obj._id);
            return obj;
          } else {
            let obj = await CourseOutcome.create({
              course: courseId,
              ...item,
            });
            id_s.push(obj._id);
            return obj;
          }
        })
      );
    }

    let deleted = await CourseOutcome.deleteMany({
      course: courseId,
      _id: { $nin: id_s },
    });
    course.outcomes = results;
    return res.status(200).json(await success("Course Updated", course));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.delete = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let courseId = req.params.courseId;
    let deleted = await Course.deleteOne({
      _id: courseId,
      user: userId,
    });
    if (deleted.deletedCount) {
      let deleted1 = await CourseOutcome.deleteMany({
        Course: courseId,
      });
    }
    return res.status(200).json(await success("Course Deleted", deleted));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};

module.exports = router;
