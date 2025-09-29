const Reminder = require("../models/Reminder");
const sendEmail = require("../utils/ses");

// ✅ Create a reminder + send SES email to multiple recipients
exports.createReminder = async (req, res) => {
  try {
    const { medication, time } = req.body;

    // Save reminder in DB (tie to logged-in user from authMiddleware)
    const reminder = new Reminder({
      medication,
      time,
      userId: req.user.id,
    });
    await reminder.save();

    // Multiple recipients (all must be verified in sandbox mode)
    const recipients = [
      "adityarajesh2022@vitbhopal.ac.in",  // your verified recipient
      "adityakumarmanav2022@vitbhopal.ac.in" // friend’s email (verify in SES too)
    ];

    const subject = "⏰ Medication Reminder - MediTrack (Test)";
    const body = `Hello! This is a reminder to take your medication: ${medication} at ${time}.`;

    // Send email to both recipients
    const result = await sendEmail(recipients, subject, body);
    console.log("✅ SES send result:", result?.MessageId || result);

    return res.status(201).json({
      message: "Reminder saved & email sent to recipients",
      reminder,
    });
  } catch (err) {
    console.error("❌ Error in createReminder:", err);
    return res.status(500).json({ error: "Failed to create reminder or send email" });
  }
};

// ✅ Get all reminders for logged-in user
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id });
    res.json(reminders);
  } catch (err) {
    console.error("❌ Error in getReminders:", err);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
};

// ✅ Delete a reminder by ID
exports.deleteReminder = async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    console.error("❌ Error in deleteReminder:", err);
    res.status(500).json({ error: "Failed to delete reminder" });
  }
};
