require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
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
        var table = new Table({
            head: [`Item ID`, `Products`, `Department`, `Price`, `Quantity in stock`],
            colWidths: [10, 20, 20, 20, 20]
        });
        for(var i = 0; i < res.length; i++){
            products = res[i];
            table.push([`${products.item_id}`,
            `${products.product_name}`,
            `${products.department_name}`,
            `$${products.price}`,
            `${products.stock_quantity}`]);
        }
        console.log(table.toString());
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
        updateItems(choice, amount);
    });
}

function updateItems(choice, amount){
    connection.query("select * from products where ?",
    {
        item_id: `${choice}`
    },function(err, newRes){
        if (err) throw err;
        var buy;
        for (var i = 0; i < newRes.length; i++){
            buy = newRes[i];
        }
        // console.log(`${choice}, ${amount}, ${buy}`);
        if(amount > buy.stock_quantity){
            console.log("Insufficient quantity!");
            buyItem();
        }else{
            console.log(`You have bought ${amount} units of ${buy.product_name}!\nThat will be $${amount * buy.price}`);
            connection.query(
                "update products set ? where ?",
                [
                    {
                        stock_quantity: (buy.stock_quantity - amount)
                    },
                    {
                        item_id: choice
                    }
                ], function(err, resp){
                    if (err) throw err;
                    console.log(`Stock updated! ${resp.affectedRows} products updated`);
                    keepBuying();
                }
            );
        }
    });
}

function keepBuying(){
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to keep shopping?",
            name: "shop",
            default: true
        }
    ]).then(function(response){
        if(response.shop === true){
            showItems();
        }else{
            console.log("Thank you for shopping at Bamazon!");
            connection.end();
        }
    })
}