var express = require('express');
var app = require("express")();
var server = require('http').Server(app);
var io = require('socket.io');
let bodyParser = require("body-parser");
var fetch = require('node-fetch');
var User = require("./models/users");
var House = require("./models/house");
var expressSession = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var passwordHash = require("password-hash");
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var Item = require('./models/items.js');
var cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
var http = require('http');
var path  = require('path');
require('dotenv').config();

var mongodbUri = process.env.mongoStuff;
var mongooseUri = uriUtil.formatMongoose(mongodbUri);
var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
var allowedOrigins = "http://localhost:* http://127.0.0.1:* http://potluck-react.herokuapp.com:*";
var ioServer = io(server, {
  origins: allowedOrigins
});
mongoose.connect(mongooseUri, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Item database connected.');
});

app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressSession({ secret: "moby" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('./potluck/build'));

passport.use(new LocalStrategy({ username: "email", password: "password" },  (email, password, done) => {
  User.findOne({
    email: email
  }, (err, foundUser) => {
    if (err) {
      console.log(err);
      next(err);
    } else if (foundUser == null){
      return done('Something went wrong! Please try again', null)
    } else {
      if (passwordHash.verify(password, foundUser.password)) {
        return done(null, foundUser);
      } else {
        return done("password and username don't match", null);
      }
    }
  })
})
)

passport.serializeUser(function (user, done) {
  done(null, user._id);
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (err) {
    } else {
      done(null, user);
    }
  })
})

function verifyEmail(email) {
  let emailReplaced = email.replace(/ /g, '');
  let emailSplit = emailReplaced.split(',');
  let arr = [];
  emailSplit.forEach((e, i) => {
    let x = emailSplit.length;
    let atSymbol = emailSplit[i].indexOf("@");
    let dotSymbol = emailSplit[i].lastIndexOf(".");
    if (atSymbol < 1 || dotSymbol < atSymbol + 2 || dotSymbol + 2 >= x.length || atSymbol === -1) {

    } else {
      arr.push(emailSplit[i])
    }
  });
  return arr.toString();
}

function inviteEmail(email) {
  let beenVerified = verifyEmail(email);
  if (beenVerified != "") {
    nodemailer.createTestAccount((err, account) => {
      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'idfkbob@gmail.com',
          pass: 'ThisIsAPassword'
        }
      });
      let mailOptions = {
        from: '"Potluck 👻" <idfkbob@gmail.com>',
        to: beenVerified,
        subject: 'Hello ✔',
        text: 'Hi there!',
        html: '<body>' +
        '<style>#bob{font-size: 50%;}</style>' +
        "<p>You have received an invitation to join your friends on our app, Potluck! </p>" +
        "<footer class=bob>Access our application at http://potluck-react.herokuapp.com ! Create an account, then join the list 'Blunderbuss' using the password '123' !</footer>" +
        '</body>',
        attachments: [{
          filename: 'nyan cat ✔.gif',
          path: './nyan.gif',
          cid: 'nyan@example.com'
        }]
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            return error;
        }
      });
    });
  }
}

function sendThing(){
  return true
}

ioServer.on('connection', (client)=>{
  console.log('WEVE CONNECTGED')
  client.on('joinHouse', (house)=>{
    console.log('joining a house: ' + house);
    client.join(house);
  });

  client.on('deleteItem', (data)=>{
    console.log('deteled item')
    House.findByIdAndUpdate({ _id:data.house  }, "items", (err, house) => {
      var num = null;
      house.items.forEach(function (e, i) {
        if (e._id == data._id) {
          num = house.items.indexOf(e);
        }
      });
      house.items.splice(num, 1);
      house.save((err, itemReturned) => {
        if (err) {
          console.log(err);
        } else {
          House.findById({ _id: data.house }, (err, house) => {
            if (err) {
              console.log(err);
            } else {
              ioServer.in(data.house).emit('updatedMyItems', house.items)
            }
          });
        }
      });
    });
  });

  client.on('selectorToServer', (data)=>{
    console.log('selected to server')
    House.findByIdAndUpdate({ _id: data.house }, "items", (err, house) => {
      house.items.forEach(function (e, i) {
        if (e._id == data._id) {
          e.selector = data.selector
          e.color = data.user.color
        }
      });
      house.save((err, itemReturned) => {
        if (err) {
          console.log(err);
        } else {
          House.findById({ _id: data.house }, (err, house) => {
            if (err) {
              console.log(err);
            } else {
              ioServer.in(data.house).emit('updatedMyItems', house.items)
            }
          });
        }
      });
    })
  });

  client.on('addedItem', (data)=>{
    console.log('adding an item')
    House.findByIdAndUpdate({ _id: data.house }, "items", (err, house) => {
      if (err) {
        console.log(err);
      } else {
        house.items.push({ name: data.item.name, quantity: data.item.quantity, selector: false })
        house.save((err, itemReturned) => {
          if (err) {
            console.log(err);
          } else {
            House.findById({ _id: data.house }, (err, house) => {
              if (err) {
                console.log(err);
              } else {
                ioServer.in(data.house).emit('updatedMyItems', house.items)
              }
            });
          }
        });
      };
    })
  })

  client.on('disconnect', ()=>{console.log("client disconnected")});
});

 app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'potluck', 'build', 'index.html'));
 });

app.post('/items', function (req, res, next) {
  var item = new Item();
  item.name = req.body.name
  item.quantity = req.body.quantity;
  item.selector = false;
  item.save(function (err, itemReturned) {
    if (err) {
      console.log(err);
      next(err);
    } else {
      Item.find(function (err, item) {
        if (err) {
          console.log(err);
          next(err);
        } else {
          res.json(item);
        }
      });
    }
  });
});

app.post('/socketUrl', (req, res)=>{
  if (process.env.PORT){
    res.json('https://potluck-react.herokuapp.com:' + process.env.PORT);
  } else {
    res.json('localhost:5000')
  }
});



app.post('/houses', function (req, res, next) {
    if (req.user) {
        House.findById(req.user.house, (err, item) => {
            if (err) {
                console.log(err);
                next(err);
            }
        }).populate('items').exec((err, items) => {
            if (items != null) {
                res.json(items);
            }
        });
    }else {
        res.json("Something went wrong.")
    }
});


app.put('/selector', (req, res, next) => {
  House.findByIdAndUpdate({ _id: req.user.house }, "items", (err, house) => {
    house.items.forEach(function (e, i) {
      if (e._id == req.body._id) {
        e.selector = req.body.selector
        e.color = req.user.color
      }
    });
    house.save((err, itemReturned) => {
      if (err) {
        console.log(err);
        next(err);
      } else {
        House.findById({ _id: req.user.house }, (err, house) => {
          if (err) {
            console.log(err);
            next(err);
          } else {
            res.json(house.items);
          }
        });
      }
    });
  })
})


// /main interface usage has been replaced with sockets
app.put('/houses/', (req, res, next) => {
  House.findByIdAndUpdate({ _id: req.user.house }, "items", (err, house) => {
    if (err) {
      console.log(err);
      next(err);
    } else {
      house.items.push({ name: req.body.name, quantity: req.body.quantity, selector: false })
      house.save((err, itemReturned) => {
        if (err) {
          console.log(err);
          next(err);
        } else {

          House.findById({ _id: req.user.house }, (err, house) => {
            if (err) {
              console.log(err);
              next(err);
            } else {
              res.json(house.items);
            }
          });
        }
      });
    };
  })
});

app.put('/delete', (req, res, next) => {
  House.findByIdAndUpdate({ _id: req.user.house }, "items", (err, house) => {
    var num = null;
    house.items.forEach(function (e, i) {
      if (e._id == req.body._id) {
        num = house.items.indexOf(e);
      }
    });
    house.items.splice(num, 1);
    house.save((err, itemReturned) => {
      if (err) {
        console.log(err);
        next(err);
      } else {
        House.findById({ _id: req.user.house }, (err, house) => {
          if (err) {
            console.log(err);
            next(err);
          } else {
            res.json(house.items);
          }
        });
      }
    });
  })


})

app.post("/signup", (req, res, next) => {
  var user = new User();
  console.log(user)
  console.log('^^254')
  
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.email = req.body.email;
  user.password = req.body.password;
  user.color = req.body.color;
  user.house = null;
  User.findOne({
    email: user.email
  }, (err, foundUser) => {
    console.log(foundUser)
    console.log('^^266')
    
    if (err) {
      res.json({
        found: false,
        message: err,
        success: false
      });
    } else if (req.body.password === ""){
        res.json({
            found: false,
            message: "Please enter a password",
            success: false
        });
    } else if (verifyEmail(user.email).length <= 0){
        res.json({
            found: false,
            message: "Invalid email",
            success: false
        });
    } else if (user.firstName.length <= 0){
        res.json({
            found: false,
            message: "Input your first name",
            success: false
        });
    } else if (user.lastName.length <= 0){
        res.json({
            found: false,
            message: "Input your last name",
            success: false
        });
    } else if (user.color.length <= 0){
        res.json({
            found: false,
            message: "Please select a color.",
            success: false
        });
    } else {
      user.save((error, userReturned) => {
         console.log(userReturned);
        if (error) {
            console.log(error);
            res.json({
                found: true,
                message: 'An account is already associated with that email address.',
                success: false
            });
        } else {
          res.json({
            userReturned: userReturned,
            found: true,
            message: "Account created.",
            success: true
          });
        }
      });
    }
  });
});

app.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user) {
    if (err) {
      res.json({ found: false, success: false, err: true, message: err });
    } else if (user) {
      req.logIn(user, (err) => {
        if (err) {
          console.log(err);
          next(err);
          res.json({ found: true, success: false, message: err })
        } else {
          res.json({ found: true, success: true, firstName: user.firstName, lastName: user.lastName })
        }
      })
    } else {
      res.json({ found: false, success: false, message: "Password and username don't match." })
    }
  })(req, res, next);
  var email = req.body.email;
  var password = req.body.password;
});


app.post('/logout', (req, res) => {
   req.logout();
   req.session.destroy();
   res.redirect('/');
});

app.post("/create-house", (req, res, next) => {
  var house = new House();
  house.houseName = req.body.houseName;
  house.password = req.body.password;
  house.roommates = req.body.roommates;
  inviteEmail(house.roommates);
  User.findOne({
    houseName: house.houseName
  }, (err, foundHouse) => {
    if (err) {
      console.log(err)
      res.json({
        found: false,
        message: err,
        success: false
      });
    } else {      
      house.save((err, houseReturned) => {
        console.log(houseReturned)
        console.log('Y THO?')
        if (err) {
          console.log(err);
          next(err);
        } else {
          res.json({
            houseReturned: houseReturned,
            found: true,
            message: "Congratulations! House List Created Successfully",
            success: true
          });
        }
      });
    }
  })
});

app.post('/getUser', (req, res, next) => {
  if (req.user){
    User.findById(req.user._id, (err, foundUser) => {
      if (err) {
        console.log(err)
      }
      }).populate('house').exec((err, user) => {
        res.json(user)
      });
  } else {
      res.json({message:'nobody logged in '});
    }
  });

app.put('/join', (req, res, next) => {
    House.findOne({ "houseName": req.body.joinHouse }, "password users housemate", (err, house) => {
        if (err) {
            next(err);
        } else if (!house) {
            res.json({ message: "Something went wrong! Please try again." });
        } else if (house.password === req.body.password) {
            User.findById(req.user._id, (err, foundUser) => {
                if (err) {
                console.log(err)
                res.json({ message: "User not found" })
                } else {
                    foundUser.house = house._id;
                    foundUser.save((err, userReturned) => {
                        if (err) {
                        next(err);
                        } else {
                          var userReturnedObj = {
                            firstName: userReturned.firstName,
                            color: userReturned.color
                          } 
                          house.housemate.push(userReturnedObj)
                          house.save((err, houseReturned) => {
                            if (err) {
                              console.log(err)
                              next(err)
                            } else {
                                res.json(houseReturned)
                          }
                    });
                }
            });
        }
    });
  };
})
})

var port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log('listening on port ' + port);
});