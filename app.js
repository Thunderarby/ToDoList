//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todoDB");

const itemSchema = {
  item: String
};

const Item = mongoose.model("item", itemSchema);

const sleep = new Item({
  item: "sleep"
});
const walk = new Item({
  item: "walk"
});
const code = new Item({
  item: "code"
});

const defaultItems = [sleep,walk,code];

const listSchema = {
  name: String,
  items:[itemSchema]
}

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find().then(function (items) {
    if (items.length === 0) {
    Item.insertMany(defaultItems).then(function () {
      console.log("successfully inserted");
    });
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: day, newListItems: items});
  }
  })

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listTitle = req.body.list;
  const newItem = new Item({
    item: item
  });
  if (listTitle == date.getDate()) {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listTitle}).then(function (foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + foundList.name);
    })
  }
  
});

app.post("/delete", function(req, res){
  console.log("successful");

  const delItem = req.body.checkbox;
  const listTitle = req.body.listTitle;
  console.log(listTitle, delItem);
  if (listTitle == date.getDate()) {
    Item.findByIdAndRemove(delItem).then(function () {
      console.log("successfully deleted");
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: delItem}}}).then(function (foundList) {
      res.redirect("/" + foundList.name);  

    })
    
    
  }
  
});



app.get("/:listTitle", function(req,res){
    
    

    List.findOne({name: req.params.listTitle}).then(function (results) {
      if (!results) {

        const list = new List({
          name: req.params.listTitle,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + list.name);
      } 
      else{
        res.render("list", {listTitle: results.name, newListItems: results.items});
      }
      console.log(results);
    })
    

  });


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
