const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());

const today = new Date();
const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
};
const day = today.toLocaleDateString("en-US", options);


mongoose.connect("mongodb+srv://jacksonmongbam123:bpheonix@bp.mhdihhd.mongodb.net/", {useNewUrlParser: true});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Add using ADD"
});
const item2 = new Item({
    name: "Check the box to DELETE"
});
const item3 = new Item({
    name: "Create new page using /example in url"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema] 
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItem, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully Inserted");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {date: day, customListName: "Today", showItems: foundItems});   
        }
    });
})

app.get("/:customList", function(req, res){
    const customName = _.capitalize(req.params.customList);
    List.findOne({name: customName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const makeList = List({
                    name: customName,
                    items: defaultItem
                });
                makeList.save();
                res.redirect("/" + customName);
            }else{
                res.render("list", {date: day, customListName: customName, showItems: foundList.items});
            }
        }
    });
})

app.post("/", function(req, res){
    const item = req.body.insertItem;
    const listName = req.body.submit;
    
    const item4 = new Item({
        name: item
    });
    if(listName === "Today"){
        item4.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item4);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
})

app.post("/delete", function(req, res){
    const delItem = req.body.delone;
    const delOne = req.body.delList;

    if(delOne === "Today"){
        Item.findByIdAndDelete(delItem, function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: delOne}, {$pull: {items: {_id: delItem}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + delOne);
            }
        })
    }

})

app.listen(process.env.PORT || 3000, function(){
    console.log("Listening to port 3000");
})
