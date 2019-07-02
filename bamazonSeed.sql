drop database if exists bamazon_db;
create database bamazon_db;
use bamazon_db;

create table products(
	item_id int not null auto_increment,
    product_name varchar(50) not null,
    department_name varchar(50) not null,
    price decimal(3,2),
    stock_quantity integer(4),
    primary key (item_id)
);

insert into products (product_name, department_name, price, stock_quantity) values
("Tea kettle", "kitchenware", 60, 400),
("Risk", "board games", 27.50, 500),
("Settlers of Catan", "board games", 35.99, 500),
("100 Bullets", "books", 19.99, 150),
("Ninja blender", "kitchenware", 150.00, 400),
("Canned peaches", "food", 3.50, 1000),
("Soy candle", "home goods", 15.99, 750),
("Battlefield V", "video games", 59.99, 350),
("Gourmet coffee", "food", 6.50, 500),
("Washer/dryer set", "home goods", 999.99, 200);