var express = require("express");
var router = express.Router();
const { mongodb, dbName, dbUrl, MongoClient } = require("../dbConfig");
const client = new MongoClient(dbUrl);

/* GET home page. */

//To get all rooms
router.get("/room", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    let requests = await db.collection("hotel").find().toArray();
    res.send({
      statusCode: 200,
      data: requests,
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      message: "Internal server error",
      error,
    });
  } finally {
    client.close();
  }
});

// To create new rooms

router.post("/create", async (req, res) => {
  data = {
    roomID: req.body.roomID,
    capacity: req.body.capacity,
    amenities: req.body.amenities,
    price: req.body.price,
    bookedStatus: "Available",
    customerName: "",
    date: "",
    startTime: "",
    endTime: "",
  };
  await client.connect();
  try {
    const db = await client.db(dbName);
    let requests = await db.collection("hotel").insertOne(data);

    res.send({
      statusCode: 200,
      message: "Room created successfully",
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      message: "Internal server error",
      error,
    });
  } finally {
    client.close();
  }
});

// To book a room

router.post("/newbooking", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);

    const user = await db
      .collection("hotel")
      .findOne({ roomID: req.body.roomID });

    if (user) {
      const update = await db.collection("hotel").updateOne(
        { roomID: req.body.roomID },
        {
          $set: {
            bookedStatus: "Occupied",
            customerName: req.body.customerName,
            date: req.body.date,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            booked: true,
          },
        }
      );
      console.log(update);
      if (update) {
        res.json({
          message: "Room booked succesfully",
        });
      } else {
        res.json({
          message: "Room booking failed",
        });
      }
    } else {
      res.json({
        message: "RoomId does exists",
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      statusCode: 500,
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});

// To get booked room details

router.get("/booked-room-details", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    const user = await db
      .collection("hotel")
      .find({ bookedStatus: "Occupied" })
      .toArray();
    res.send({
      statusCode: 200,
      data: user,
      message: "Following are booked room details",
    });
  } catch (error) {
    console.log(error);
    res.send({
      statusCode: 500,
      message: "Internal servre error",
    });
  } finally {
    client.close();
  }
});

// To get booked customer details

router.get("/booked-customer-details", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);

    const user = await db
      .collection("hotel")
      .find({ bookedStatus: "Occupied" })
      .project({
        customerName: 1,
        roomID: 1,
        date: 1,
        startTime: 1,
        endTime: 1,
      })
      .toArray();
    res.send({
      statusCode: 200,
      data: user,
      message: "Booked customer details",
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});

module.exports = router;
