const { ObjectId } = require("mongodb");
const { success, error } = require("../utils/response");
const { Program, ProgramOutcome } = require("../models/program");
const Resource = require("../models/resource");
const Activity = require("../models/activity");
const router = {};
router.get = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let courseId = req.params.courseId;
    let activity = await Activity.aggregate([
      { $match: { user: ObjectId(userId), course: ObjectId(courseId) } },
      {
        $lookup: {
          from: Resource.collection.name,
          localField: "resource",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                course: true,
                id: true,
                name: true,
                type: true,
                interaction_time: true,
                url: true,
                citation: true,
              },
            },
          ],
          as: "resource",
        },
      },
      {
        $project: {
          id: true,
          title: true,
          type: true,
          resource: true,
          course: true,
          assessment: true,
          interaction_time: true,
          clock_hour: true,
          activity_details: true,
        },
      },
    ]);

    return res.status(200).json(await success("All Activities", activity));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};
router.getOne = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let courseId = req.params.courseId;
    let activityId = req.params.activityId;
    let activity = await Activity.aggregate([
      {
        $match: {
          user: ObjectId(userId),
          course: ObjectId(courseId),
          _id: ObjectId(activityId),
        },
      },
      {
        $lookup: {
          from: Resource.collection.name,
          localField: "resource",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                course: true,
                id: true,
                name: true,
                type: true,
                interaction_time: true,
                url: true,
                citation: true,
              },
            },
          ],
          as: "resource",
        },
      },
      {
        $project: {
          id: true,
          title: true,
          type: true,
          resource: true,
          course: true,
          assessment: true,
          interaction_time: true,
          clock_hour: true,
          activity_details: true,
        },
      },
    ]);

    return res.status(200).json(await success("Activity Info", activity[0]));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error(err.message, err));
  }
};

router.post = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let courseId = req.params.courseId;
    let obj = req.body;

    let activity = await Activity.create({
      ...obj,
      user: userId,
      course: courseId,
    });

    return res.status(200).json(await success("Activity Added", activity));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error("Something went wrong!", err));
  }
};
router.update = async (req, res) => {
  try {
    let userId = req.decoded.userId;
    let courseId = req.params.courseId;
    let activityId = req.params.activityId;

    let obj = req.body;

    let activity = await Activity.findOneAndUpdate(
      {
        user: ObjectId(userId),
        course: ObjectId(courseId),
        _id: ObjectId(activityId),
      },
      obj,
      { new: true }
    );

    return res.status(200).json(await success("Activity Updated", activity));
  } catch (err) {
    console.log(err);
    res.status(500).json(await error("Something went wrong!", err));
  }
};
module.exports = router;
