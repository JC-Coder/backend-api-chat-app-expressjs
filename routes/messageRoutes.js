const router = require("express").Router();
const Message = require("../models/Message");

router.post("/create", async (req, res) => {
  let { room, content, sender, time, date } = req.body;

  if (!room || !content || !sender) {
    res.status(400).json("All field must be filled");
    return;
  }

  try {
    if (!date) {
      const newDate = new Date();
      let year = newDate.getFullYear()
      let month = newDate.getMonth() + 1;
      let day = newDate.getDate();

      date = `${day < 10 ? '0'+day : day}/${month < 10 ? '0'+month : month}/${year}`
    }

    if (!time) {
      let newDate = new Date();
      let newTime = newDate.getTime();
      time = newTime;
    }

    const newMessage = await Message.create({
      content,
      from: sender,
      time,
      date,
      to: room,
    });

    res.status(201).json({ data: newMessage, message: "message created" });
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.get("/", async (req, res) => {
  const messages = await Message.find();
  res.status(200).json(messages);
});

router.post("/room", async (req, res) => {
  const { room } = req.body;

  if (!room) return res.status(400).json("room is required");

  try {
    const roomMessages = await Message.aggregate([
        {
            $match: {to: room}
        },
        {
            $group: {
                _id: "$date",
                messagesByDate: {$push: "$$ROOT"}
            },
        },
        {
            $sort: {"date": 1}
        }
    ])

    return res.status(200).json(roomMessages);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
