require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");
var choice;
var amount;

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: process.env.DB_Password,
    database: "bamazon_db"
});

connection.connect(function(err){
    if (err) throw err;
    console.log(`Connected at id ${connection.threadId}`);
    showItems();
});

function showItems(){
    connection.query("select * from products", function(err, res){
        if (err) throw err;
        var products;
        console.log(`Item ID | Products | Department | Price | Quantity in stock   
============================================================\n`);
        for(var i = 0; i < res.length; i++){
            products = res[i];
            console.log(`${products.item_id} | ${products.product_name} | ${products.department_name} | $${products.price} | ${products.stock_quantity}`);
        }
        buyItem();
    });
}

function buyItem(){
    inquirer.prompt([
        {
            type: "number",
            message: "Which item ID would you like to select?",
            name: "id"
        },
        {
            type: "number",
            message: "How much of that item would you like to buy?",
            name: "quant"
        }
    ]).then(function(response){
        choice = response.id;
        amount = response.quant;
        connection.query("select * from products where ?",
            {
                item_id: choice
            }
        ),function(err, newRes){
            if (err) throw err;
            if(amount < newRes.stock_quantity){
                console.log("Insufficient quantity!");
                buyItem();
            }else{
                console.log(`You have bought ${amount} of ${newRes.product_name}!`);
                updateItem(choice, amount);
            }
        }
    });
}

function updateItem(choice, amount){
    connection.query(
        "update products set ? where ?",
        [
            {
                stock_quantity: amount
            },
            {
                item_id: choice
            }
        ], function(err, resp){
            if (err) throw err;
            console.log(`Stock updated! ${resp.affectedRows} products updated`);
            connection.end();
        }
    );
}