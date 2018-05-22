/*********************************************************************************
*  WEB322 – Assignment 07
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Oleksandr Peretokin Student ID: 126455153 Date: 2017-12-27
*
*  Online (Heroku) Link:  https://mysterious-tor-91920.herokuapp.com/
*
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var dataService = require("./data-service.js");

var clientSessions = require("client-sessions");
var dataServiceAuth = require("./data-service-auth.js");

var app = express();
var path = require("path");

const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const dataServiceComments = require("./data-service-comments.js");

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// This will ensure that the bodyParser middleware will work correctly.
// Also, this will allow the .hbs extensions to be properly handled,
// add the custom Handlebars helper: "equal"
// and set the global default layout to our layout.hbs file
// Start of block hbs
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

// Setup client-sessions
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "assignment7_WEB322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));



app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }

//app.listen(HTTP_PORT);
app.get("/", function(req,res){
    res.render("home");
});

app.get("/about", function(req, res) {
    //res.render("about");
    dataServiceComments.getAllComments()
        .then((commentData)=>{
            res.render("about",{data:commentData});
        }).catch((errorMessage)=>{
            res.render("about");
        });       
});
 

app.use(express.static("static"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.engine(".hbs", exphbs({
  extname: ".hbs",
  defaultLayout: 'layout',
  helpers: {
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
}));
app.set("view engine", ".hbs");



app.get("/employees", ensureLogin, function(req,res){
    
    if (req.query.manager) {
    dataService.getEmployeesByManager(req.query.manager).then((data) => {
      // By only calling res.json() from within .then() or .catch() we can ensure that the data will be in place 
      // (no matter how long it took to retrieve) before the server sends anything back to the client.
      // res.json(data); old code
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err) => {
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  }
  //full-part time emps
  else if (req.query.status) {
    dataService.getEmployeesByStatus(req.query.status).then((data) => {
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err) => {
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  }
  // emps in dept
  else if (req.query.department) {
    dataService.getEmployeesByDepartment(req.query.department).then((data) => {
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err) => {
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  }
  //all emps
  else {
    dataService.getAllEmployees().then((data) => {
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err) => {
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  }
})
  
app.get("/employee/:empNum",  ensureLogin, (req, res) => {

  // initialize an empty object to store the values
   let viewData = {};
  console.log("/employee/:empNum = " + req.params.empNum);
  dataService.getEmployeeByNum(req.params.empNum).then((data) => {
    viewData.data = data; //store employee data in the "viewData" object as "data" 
  }).catch(() => {
    viewData.data = null; // set employee to null if there was an error 
  }).then(dataService.getDepartments).then((data) => {
    viewData.departments = data; // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
    for (let i = 0; i < viewData.departments.length; i++) {
      if (viewData.departments[i].departmentId == viewData.data.department) {
        viewData.departments[i].selected = true;
      }
    }
  }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
  }).then(() => {
    if (viewData.data == null) { // if no employee - return an error
      res.status(404).send("Employee Not Found");
    } else {
      console.log("viewData.data.employeeNum = " + viewData.data.employeeNum);
      console.log("viewData.data.firstName = " + viewData.data.firstName);
      console.log("viewData.data.last_name = " + viewData.data.last_name);

      res.render("employee", { viewData: viewData }); // render the "employee" view }
    }
  });
});

// /managers
app.get("/managers", ensureLogin, function(req,res){
        dataService.getManagers().then((data) => {
    res.render("employeeList", { data: data, title: "Employees (Managers)" });
  }).catch((error) => {
    res.render("employeeList", { data: {}, title: "Employees (Managers)" });
  });
});

//add employee
app.get("/employees/add", ensureLogin, (req,res) => {
dataService.getDepartments().then((data) => {
    res.render("addEmployee", { departments: data });
  }).catch((error) => {
    res.render("addEmployee", { departments: [] });
  })
});

//add employee form post
app.post("/employees/add", (req, res) => {
  dataService.addEmployee(req.body).then((data) => {
    res.redirect("/employees");
  });
});

  //UPDATE
app.post("/employee/update", (req, res) => {
  dataService.updateEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

//DELETE EMP
app.get("/employee/delete/:empNum", ensureLogin, (req, res) => {

  dataService.deleteEmployeeByNum(req.params.empNum).then(() => {
    res.redirect("/employees");
  }).catch(() => {
    res.status(500).send("Unable to Remove Employee / Employee not found)");
  });
});

  //Add & update Dep
app.get("/departments",  ensureLogin, function(req,res){
        dataService.getDepartments().then(function(data){
          res.render("departmentList", { data: data, title: "Departments" }); 
        }).catch(function(error){
          res.render("departmentList", { data: {}, title: "Departments" });
        });
});

app.get("/departments/add", ensureLogin, (req, res) => {
  dataService.getDepartments().then((data) => {
    res.render("addDepartment", { data: data, title: "Departments" });
  }).catch((error) => {
    res.render("addDepartment", { data: {}, title: "Departments" });
  });
});

//DEP POST 
app.post("/departments/add", (req, res) => {
  dataService.addDepartment(req.body).then(() => {
    res.redirect("/departments");
  });
});

app.post("/departments/update", (req, res) => {
  dataService.updateDepartment(req.body).then(() => {
    console.log("app.post(/department/update was called");
    res.redirect("/departments");
  });
});

app.get("/department/:departmentId",  ensureLogin, (req, res) => {
  dataService.getDepartmentById(req.params.departmentId).then((data) => {
    console.log("sending " + data.departmentName + "\nto res.render(department)");
    res.render("department", { data: data })
  }).catch((error) => {
    res.status(404).send("Department Not Found");
  });
});


//ADD COMMENT
app.post("/about/addComment", (req, res) => {
    dataServiceComments.addComment(req.body)
        .then(() => {
            res.redirect("/about");
        }).catch((err) => {
            console.log(err);
            res.redirect("/about");
        });
});

//ADD REPLY
app.post("/about/addReply", (req, res) => {
    dataServiceComments.addReply(req.body)
        .then(() => {
            res.redirect("/about");
        }).catch((err) => {
            console.log(err);
            res.redirect("/about");
        });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body)
        .then(() => {
            console.log("success!!");
            res.render("register", {successMessage: "User created"});
        }).catch((err) => {
            console.log("error:"+err);
            res.render("register", {errorMessage: err, user: req.body.user});
        });
});


app.post("/login", (req, res) => {

    console.log("login");
    dataServiceAuth.checkUser(req.body)
    .then(() => {
        req.session.user = req.body.user;
        console.log("result:"+req.session.user);
        res.redirect("/employees");
    }).catch((err) => {
        res.render("login", {errorMessage: err, user: req.body.user});
    });
    
});

app.use(function(req, res) {
    res.status(404).send(" 404 error : Page Not Found");
});

dataService.initialize()
.then(dataServiceComments.initialize)
.then(dataServiceAuth.initialize)
.then(()=>{
    console.log('data was read well');
    app.listen(HTTP_PORT, onHttpStart);
})
.catch((errorMessage)=>{
    console.log("unable to start dataService");
});  

/*app.listen(HTTP_PORT, function(res,req){
         console.log("Express http server listening on: " + HTTP_PORT);
         dataService.initialize().then(function(data){
             console.log(data)
           }).catch(function(error){
             console.log(error);
           });
}); */


/*app.get("/employee/:empNum", function(req,res){
  dataserver.getEmployeeByNum(req.params.empNum).then((data) => {
    res.render("employee", { data: data });
}).catch((err) => {
    res.status(404).send("Employee Not Found!!!");
});
}); */

// /employee/value
//putting :before empNum makis it like/**/ a variable



