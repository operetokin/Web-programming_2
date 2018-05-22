const connectionString = 'mongodb://operetokin:September_2017@ds139480.mlab.com:39480/web322_a6_operetokin';


const mongoose = require('mongoose'); 
let Schema = mongoose.Schema;

var userSchema = new Schema({
    "user"    : {
        "type"  : String,
        "unique": true
     },
    "password": String
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(connectionString);

        db.on('error', (err)=>{
            reject(err);  // reject the promise with the provided error 
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = (userData) => {

    return new Promise((resolve, reject) => {

        console.log("userData.password:"+ userData.password);
        console.log("userData.password2:"+ userData.password2);

        if (userData.password != userData.password2)
        {
            console.log("Passwords do not match");
            reject("Passwords do not match");
        } 
        else 
        {
            let newUser = new User(userData);
            newUser.save((err) => {
                if (err) {
                    if (err.code == 11000)
                    {
                        reject("User Name already taken");
                    } 
                    else 
                    {
                        reject("There was an error creating the user: " + err);
                    }
                    
                } 
                else 
                {
                    resolve();
                }
                // exit the program after saving
                //process.exit();
            });
        }

    });  // return new Promise
};

module.exports.checkUser = (userData) => {

    return new Promise((resolve, reject) => {

        console.log("userData.user:" + userData.user);
        User.find({ user: userData.user })
        .exec()
        .then((findUser) => {
            
            if (findUser)
                console.log("User Found: " + findUser[0].user);
            else
                console.log("Unable to find user: " + userData.user);

            console.log("userData.password:" + userData.password);
            console.log("findUser[0].password: " + findUser[0].password);

            if (findUser.length == 0)
            {
                console.log("Unable to find user: " + userData.user);
                reject("Unable to find user: " + userData.user);
            }                
            else if (findUser[0].password != userData.password)
            {                
                console.log("Incorrect Password for user: " + userData.user);
                reject("Incorrect Password for user: " + userData.user);
            } 
            else
            {
                console.log("find user: " + userData.user);
                resolve();
            }
            
        })
        .catch((err) => {
            reject("Unable to find user: " + userData.user);
        });

    });  // return new Promise

}