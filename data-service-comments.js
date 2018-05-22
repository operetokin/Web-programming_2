const connectionString = 'mongodb://operetokin:September_2017@ds139480.mlab.com:39480/web322_a6_operetokin';

const mongoose = require('mongoose'); 
let Schema = mongoose.Schema;

var contentSchema = new Schema({
    "authorName" : String,
    "authorEmail": String,
    "subject"    : String,
    "commentText": String,
    "postedDate" : Date,
    "replies"    : [{
        "comment_id" : String,
        "authorName" : String,
        "authorEmail": String,
        "commentText": String,
        "repliedDate": Date
    }]
});


let Comment; // = mongoose.model("web322_a6", contentSchema);

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(connectionString);

        db.on('error', (err)=>{
            reject(err);  // reject the promise with the provided error 
        });
        db.once('open', ()=>{
            Comment = db.model("comments", contentSchema);
            resolve();
        });
    });
};


module.exports.addComment = (data) => {

    return new Promise((resolve, reject) => {

        data.postedDate = Date.now();

        let newComment = new Comment(data);
        newComment.save((err) => {
            if (err) {
                reject("There was an error saving the comment");
            } else {
                resolve(newComment._id);
            }
        });
        
    }); 
};

module.exports.getAllComments = () => {

    return new Promise((resolve, reject) => {

        Comment.find()
        .sort({postedDate:'asc'})
        .exec()
        .then((comment) => {
            resolve(comment);
        })
        .catch((err) => {
            reject(err);
        });

    }); 
};


module.exports.addReply = (data) => {
    console.log(data);
    return new Promise((resolve, reject) => {

        data.repliedDate = Date.now();

        Comment.update(
            { _id: data.comment_id },
            { $addToSet: {replies: data} },
            { multi: false }
        )
        .exec()
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });

    }); 
};