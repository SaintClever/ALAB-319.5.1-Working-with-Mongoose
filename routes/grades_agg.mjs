import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();


// Get greater than 70 
router.get("/stats/average", async (req, res) => {
  let collection = db.collection("grades");

  // Change 70 to 50 to see a different result
  let greaterThan = [
    { $unwind: "$scores" },
    { $group: 
      { 
        _id: "$learner_id", 
        averageScore: { $avg: "$scores.score" }
      }
    },
    {
      $match: { averageScore: { $gte: 70 } }
    }
  ];

  let result = await collection.aggregate(greaterThan).toArray(); 

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// The total number of learners
router.get("/stats/learnercount", async(req, res) => {
  let collection = db.collection("grades");
  let leanerCount = [{ $count: "leanerCount" }];
  let result = await collection.aggregate(leanerCount).toArray();

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Find class_id
router.get("/stats/:id", async (req, res) => {
  let collection = db.collection("grades");
  let query = [
    {
      $match: {
        "class_id": { $eq: Number(req.params.id) }
      }
    }
  ];

  let result = await collection.aggregate(query).toArray();

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

/**
 * It is not best practice to seperate these routes
 * like we have done here. This file was created
 * specifically for educational purposes, to contain
 * all aggregation routes in one place.
 */

/**
 * Grading Weights by Score Type:
 * - Exams: 50%
 * - Quizes: 30%
 * - Homework: 20%
 */

// Get the weighted average of a specified learner's grades, per class
router.get("/learner/:id/avg-class", async (req, res) => {
  let collection = await db.collection("grades");

  let result = await collection
    .aggregate([
      {
        $match: { learner_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      }
    ])
    .toArray();

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

export default router;
