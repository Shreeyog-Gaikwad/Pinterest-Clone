var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");
const path = require('path');
const fs = require('fs');

passport.use(new localStrategy(userModel.authenticate()));

// API Endpoint for SignUp Screen
router.get("/", function (req, res, next) {
  res.render("index", { error: req.flash("error") });
});

// API Endpoint for Login Screen
router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});

// API Endpoint for Profile Page
router.get("/profile", isLoggedin, async function (req, res, next) {
  let user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
  res.render("profile", { user });
});

// API Endpoint for uploading Profile Pic
router.post(
  "/uploadpic",
  isLoggedin,
  upload.single("profImg"),
  async (req, res, next) => {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImg = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

// API Endpoint for Editing users Screen.
router.get('/edit', isLoggedin, async function(req,res){
  let user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render('edit', { user });
  console.log({user});
})

// API Endpoint for Editing Users.
router.post('/update/:id', async function(req,res){
    const { name, username, bio, website, instagram, facebook, linkedin  } = req.body;
    await userModel.findByIdAndUpdate(req.params.id, { name, username, bio, instagram, facebook, linkedin, website  });
    res.redirect('/profile'); 
})

// API Endpoint for Adding Post
router.get("/add", isLoggedin, async function (req, res, next) {
  let user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("add", { user });
});

// API Endpoint for uploading Users Post(images)
router.post(
  "/createpost",
  isLoggedin,
  upload.single("postImg"),
  async (req, res) => {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const postData = await postModel.create({
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename,
      user: user._id,
    });
    user.posts.push(postData._id);
    await user.save();
    res.redirect("/profile");
  }
);

// API Endpoint for showing all feed.
router.get("/feed", isLoggedin, async (req, res) => {
  const posts = await postModel.find().populate("user");
  console.log(posts);
  res.render("feed", { posts });
});

// API Endpoint for showing specific Post.
router.get("/post/:postId", isLoggedin, getPostAndRender, async function (req, res) {
  const { postId } = req.params;
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const post = await postModel.findOne({ _id: postId, user: user._id });

  res.render("post", { post, user });
}
);

// API Endpoint for Downloading users post
router.get('/download/:filename', (req, res) => {
  const { filename } = req.params; // Extract filename from route parameters
  const filePath = path.join(__dirname, '../public/images/uploads', filename); // Construct full file path

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist:', filePath); // Log error for debugging
      return res.status(404).send('File not found'); // Respond with 404 if file does not exist
    }

    // Proceed with file download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('File download error:', err); // Log error for debugging
        res.status(500).send('Error downloading file'); // Respond with 500 if there is an error during download
      }
    });
  });
});

// API Endpoint for SignUp
router.post("/signup", async function (req, res, next) {
  let userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });
  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

// API Endpoint for Login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) { }
);

// API Endpoint for Logout
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

// Function for checking users logged in status
function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Function for retriving only the Date and Time from createdAt field in Post Model.
async function getPostAndRender(req, res) {
  const post = await postModel.findById(req.params.postId).exec();
  const user = await userModel.findOne({ username: req.session.passport.user });

  // Extract and format the date
  const date = post.createdAt;
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const formattedTime = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  res.render("post", { post, formattedDate, formattedTime, user });
}

module.exports = router;
