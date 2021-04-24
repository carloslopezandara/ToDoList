const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin-carlos:test123@cluster0.mgkrm.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
var _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item",itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("list", listSchema);

const item1 = new Item({name:"Welcome to your to do list"});
const item2 = new Item({name:"Hit the + to add a new Item"});
const item3 = new Item({name: "<-- Hit to delete this item"});

const defaultItems = [item1,item2,item3];

app.get("/", function(req, res) {
  // let day = date.getDate();
  Item.find(function(err, items){
    if (items.length === 0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Items inserted successfully");
          res.redirect("/");
        }
      });
    }else{
      if (err){
        console.log(err);
      }else{
        res.render("list", {listTitle:"Today" , listItems: items});
      }
    }
  });
});

app.get("/:customListName", function(req, res){
  const listName = _.capitalize(req.params.customListName);
  List.findOne({name:listName}, async function(err, newList){
    if (err){
      console.log(err);
    }
    else{
      if (!newList){
        const list = new List ({name:listName, items:defaultItems});
        await list.save();
        res.redirect("/"+listName);
      }
      else{
        res.render("list", {listTitle:listName, listItems:newList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({name:itemName});
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err, list){
      if (err){
        console.log(err);
      }
      else{
        list.items.push(item);
        list.save();
        res.redirect("/"+listName);
      }
    });
  }
});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if (listName === "Today"){
    Item.deleteOne({_id:req.body.checkbox}, function(err){
      if (err){
        console.log(err);
      }
      else{
        console.log("Item deleted");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id:id}}}, function(err, list){
      if (!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.listen(3000, function() {
  console.log("Listening on port 3000");
})
