require('dotenv').config();

/////////////
// IMPORTS //
/////////////

const Sequelize = require('sequelize');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

//////////////
// VAR DEFS //
//////////////

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  host: 'localhost',
  storage: 'database.sqlite'
});
const app = express();
const port = process.env.PORT;

///////////////////////
// MODEL DEFINITIONS //
///////////////////////

var User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.TEXT,
  email: Sequelize.TEXT
});

var Video = sequelize.define('video', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  iconPath: Sequelize.TEXT,
  videoPath: Sequelize.TEXT
});

User.hasMany(Video); // Video Owners

sequelize.sync({force: true});

////////////////
// MIDDLEWARE //
////////////////


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

///////////////
// FUNCTIONS //
///////////////

function checkPassword(password) {

    // this function is used to require passwords to fill characteristics

    return false; // means everything is good

}

function checkEmail(email) {

  // this function is used to require emails to fill characteristics

  return false; // means everything is good

}

function checkUsername(username) {

  // this function is used to require usernames to fill characteristics

  return false; // means everything is good

}

////////////
// ROUTES //
////////////

app.post('/api/v1/user/create', function (req, res) {

  // check user filled out entire form
  if (req.body.username == undefined || req.body.email == undefined || req.body.password == undefined) return res.sendStatus(400);

  // check all data fits the molds
  if (checkUsername(req.body.username) || checkEmail(req.body.email) || checkPassword(req.body.password)) return res.sendStatus(400);

  // check data doesn't already exist
  User.findAll({
    where: {
      [Sequelize.Op.or]: [
        {
          username: req.body.username
        },
        {
          email: req.body.email
        }
      ]
    }
  }).then(function (data) {

    if (data.length > 0) return res.sendStatus(409);

    // hash password
    bcrypt.hash(req.body.password, 10, function(err, hash) {

      if (err) {

        console.log(err);
        return res.sendStatus(500);

      }

      // enter data into database
      User.create({
        username: req.body.username,
        password: hash,
        email: req.body.email
      }).then(function (insertData) {

        // create and send jwt
        return res.json({
          token: jwt.sign({
            id: insertData.id,
            username: insertData.username,
            email: insertData.email
          }, process.env.privateKey)
        });

      }).error(function (error) {

        console.log(error);
        return res.sendStatus(500);

      });

    });

  }).error(function (error) {

    console.log(error);
    return res.sendStatus(500);

  });

});

app.post('/api/v1/user/login', function (req, res) {

  // check user filled out entire form
  if (req.body.email == undefined || req.body.password == undefined) return res.sendStatus(400);

  // find user
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(function (data) {

    if (data == null) return res.sendStatus(404);

    // check password hash
    bcrypt.compare(req.body.password, data.password, function(err, result) {

      if (err) {

        console.log(err);
        return res.sendStatus(500);

      }

      if (!result) return res.sendStatus(401);

      // create and send jwt
      return res.json({
        token: jwt.sign({
          id: data.id,
          username: data.username,
          email: data.email
        }, process.env.privateKey)
      });

    });

  }).error(function (error) {

    console.log(error);
    return res.sendStatus(500);

  });

});

app.post('/api/v1/video/upload', function (req, res) {

  if (req.body.title == undefined || req.body.description == undefined) return res.sendStatus(400);

  if (!req.files || Object.keys(req.files).length === 0) return res.sendStatus(400);

  if (req.files.video == undefined || req.files.icon == undefined) return res.sendStatus(400);

  var iconPath = '/public/icon/' + new Date().getTime() + "-" + req.files.icon.name;
  var videoPath = '/public/video/' + new Date().getTime() + "-" + req.files.video.name;

  req.files.video.mv(__dirname + videoPath, function(err) {
    if (err) return res.sendStatus(500);

    req.files.icon.mv(__dirname + iconPath, function(err) {
      if (err) return res.sendStatus(500);

      Video.create({
        title: req.body.title,
        description: req.body.description,
        iconPath: iconPath,
        videoPath: videoPath
      }).then(function (data) {

        return res.json({
          id: data.id
        });

      }).error(function (error) {

        console.log(error);
        return res.sendStatus(500);

      });

    });

  });

});

//////////////
// END CODE //
//////////////

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
