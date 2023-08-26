//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose")
const _=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

async function run(){

await mongoose.connect("mongodb+srv://sashanknaga:12345@cluster0.p5nzmdd.mongodb.net/todolistDB")

console.log("connection successful");

const itemSchema=mongoose.Schema({
  name:String
})
const listSchema=mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const Item=await mongoose.model("item",itemSchema)

const List=await mongoose.model("list",listSchema)

const item1=new Item({
  name:"Welcome to your todolist"
})
const item2=new Item({
  name:"Hit the + button to add a new item"
})
const item3=new Item({
  name:"<--- click this to delete a item"
})

const Items=[item1,item2,item3];


app.get("/", async function(req, res) {

 const items=await Item.find({})

 if(items.length===0){
  await Item.insertMany(Items)
 }
else {
  res.render("list", {listTitle: "Today", newListItems: items});  
}

});

app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem=new Item({
    name:itemName
  })
if(listName==="Today"){
  newItem.save()
  res.redirect("/")
}
else{
  List.findOne({name:listName}).then(async (currentList)=>{
    await currentList.items.push(newItem)
    currentList.save()
    res.redirect("/"+currentList.name)
  })
} 
});

app.post("/delete", async function(req, res){
  const id = req.body.id;
  const listName=req.body.name
  if(listName==="Today"){
    await Item.deleteOne({_id:id})
    res.redirect("/")  
  }
  else{
   await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}})
      res.redirect("/"+listName)
    }
      
    }
);


app.get("/:route", async function(req,res){
  const route=_.capitalize(req.params.route)
  List.findOne({name:route}).then((selectedList)=>{
    if(selectedList===null){
      const list=new List({
        name:route,
        items:Items
      })
      list.save()
      res.redirect("/"+route)
    }
    else{
      res.render("list", {listTitle: route, newListItems: selectedList.items});
    }
  
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});



// mongoose.connection.close()

}
run()