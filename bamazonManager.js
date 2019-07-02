require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

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
    showMenu();
});

function showMenu(){
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View products for sale", 
            "View low inventory", 
            "Add to inventory", 
            "Add new product", "Exit"],
            name:"select"
        }
    ]).then(function(response){
        if(response.select == "View products for sale"){
            showItems();
        }else if(response.select == "View low inventory"){
            showLowInv();
        }else if(response.select == "Add to inventory"){
            addInv();
        }else if(response.select == "Add new product"){
            addProduct();
        }else {
            console.log("Bye!");
            connection.end();
        }
    })
}

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
        showMenu();
    });
}

function showLowInv(){
    connection.query("select * from products where stock_quantity <= ?",[5], 
    function(err, res){
        if (err) throw err;
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
        showMenu();
    });
}

function addInv(){
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
        inquirer.prompt([
            {
                type: "number",
                message: "Which item ID would you like to select?",
                name: "id"
            },
            {
                type: "number",
                message: "How much of that item would you like to add?",
                name: "add"
            }
        ]).then(function(response){
            var choice = response.id;
            var amount = response.add;
            connection.query("select * from products where ?",{
                item_id: choice
            }, function(err, resp){
                if (err) throw err;
                var prod;
                for(var i = 0; i < resp.length; i++){
                    prod = resp[i];
                }
                connection.query(
                    "update products set ? where ?",
                    [
                        {
                            stock_quantity: (amount + prod.stock_quantity)
                        },
                        {
                            item_id: choice
                        }
                    ], function(err, resp){
                        if (err) throw err;
                        console.log(`Stock updated! ${resp.affectedRows} products updated`);
                        showMenu();
                    }
                );
            })
        });
    });
}

function addProduct(){
    inquirer.prompt([
        {
            type: "input",
            message: "What product would you like to add?",
            name: "name"
        },
        {
            type: "input",
            message: "Add department: ",
            name: "cat"
        },
        {
            type: "number",
            message: "Enter price: ",
            name: "price"
        },
        {
            type: "number",
            message: "Enter quantity in stock: ",
            name: "quantity"
        }
    ]).then(function(response){
        var name = response.name;
        var cat = response.cat;
        var price = response.price;
        var quantity = response.quantity;
        var values = [
            [[`${name}`],
            [`${cat}`],
            [`${price}`],
            [`${quantity}`]]];
        connection.query("insert into products (product_name, department_name, price, stock_quantity) values ?",
        [values],
        function(err, newRes){
            if (err) throw err;
            console.log(`${newRes.affectedRows} product added`);
            showMenu();
        })
    })
}