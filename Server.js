const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "80mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const Admin = require("./models/ClubAdmin");
const Club = require("./models/Club");

const mongoURI = "mongodb+srv://aman:123456@at@cluster0.q7qv0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let otpStore = {};
mongoose
  .connect("mongodb+srv://aakash12:bi9ngQNvB1rY2r29@cluster0.q7qv0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

const conn = mongoose.connection;



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    Admin: "hiiabcd123@gmail.com",
    pass: "vuis eqyc ghvh aejr",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if an admin with the same email exists
    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "An admin with this email already exists",
        status: false,
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Admin without associating any club
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully. Please add a club.",
      status: true,
      admin: { name: newAdmin.name, email: newAdmin.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      status: false,
    });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", status: false });
  }

  try {
    const admin = await Admin.findOne({ email }); // Use a different variable name
    if (!admin) {
      return res
        .status(400)
        .json({ message: "Invalid email or password", status: false });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid email or password", status: false });
    }

    res.status(200).json({
      message: "Login successful",
      status: true,
      admin: { name: admin.name, email: admin.email }, // Use the correct variable name
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", status: false });
  }
});

app.post("/add-club", async (req, res) => {
  const {email, name, club_message, club_poster, pi_name, pi_message, about, gallery, members, events, social_links } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Club name is required." });
  }
  if (!email) {
    return res.status(400).json({ message: "email is required." });
  }
  try {
    // Create new Club instance
    const newClub = new Club({
      email,
      name,
      club_message,
      club_poster,
      pi_name,
      pi_message,
      about,
      gallery,
      members,
      events,
      social_links,
    });

    // Save to MongoDB
    await newClub.save();

    res.status(201).json({
      message: "Club added successfully",
      club: newClub,
      status: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      status: false,
    });
  }
});

// Route to fetch all clubs
app.get("/get-clubs", async (req, res) => {
  try {
    // Retrieve all clubs from MongoDB
    const clubs = await Club.find();

    res.status(200).json({
      message: "Clubs retrieved successfully",
      clubs,
      status: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      status: false,
    });
  }
});

app.get("/get-club/:name", async (req, res) => {
  try {
    const club = await Club.findOne({ name: req.params.name });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    res.status(200).json({ message: "Club retrieved successfully", club });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// app.post("/request-otp", (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).send("Email is required");
//   }

//   const otp = crypto.randomInt(100000, 999999).toString();

//   const mailOptions = {
//     from: "hiiabcd123@gmail.com", // Use environment variable
//     to: email,
//     subject: "Your OTP Code",
//     text: `Your OTP code is ${otp}`,
//   };

//   transporter.sendMail(mailOptions, (error) => {
//     if (error) {
//       console.error(error);
//       return res
//         .status(500)
//         .json({ error: "Error sending OTP", status: false });
//     } else {
//       otpStore[email] = otp;
//       console.log(`Stored OTP for ${email}: ${otpStore[email]}`); // Debug log
//       return res
//         .status(200)
//         .json({ message: "OTP sent successfully", status: true });
//     }
//   });
// });

// app.post("/verify-otp", (req, res) => {
//   const { email, otp } = req.body;
//   if (!email || !otp) {
//     return res.status(400).json({ error: "Email and OTP are required" });
//   }

//   if (otpStore[email] && otpStore[email] === otp) {
//     delete otpStore[email]; // Optionally delete the OTP after successful verification
//     return res
//       .status(200)
//       .json({ message: "OTP verified successfully", status: true });
//   } else {
//     return res
//       .status(400)
//       .json({ message: "otp did not match!!!", status: false });
//   }
// });


app.put("/edit-club/:email", async (req, res) => {
  const { email } = req.params;  // Get the email from the URL parameters
  const { name, club_message, club_poster, pi_name, pi_message, about, gallery, members, events, social_links } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Find the club by email
    const existingClub = await Club.findOne({ email });

    if (!existingClub) {
      return res.status(404).json({
        message: "Club not found with this email.",
        status: false,
      });
    }

    // Update the club details
    existingClub.name = name || existingClub.name;
    existingClub.club_message = club_message || existingClub.club_message;
    existingClub.club_poster = club_poster || existingClub.club_poster;
    existingClub.pi_name = pi_name || existingClub.pi_name;
    existingClub.pi_message = pi_message || existingClub.pi_message;
    existingClub.about = about || existingClub.about;
    existingClub.gallery = gallery || existingClub.gallery;
    existingClub.members = members || existingClub.members;
    existingClub.events = events || existingClub.events;
    existingClub.social_links = social_links || existingClub.social_links;

    // Save the updated club details
    await existingClub.save();

    return res.status(200).json({
      message: "Club details updated successfully.",
      club: existingClub,
      status: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      status: false,
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});