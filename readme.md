# E-commerce-website

## Table of contents

- [Introduction](#introduction)
- [Demo](#demo)
- [How-to-run](#how-to-run)
- [Technology](#technology)
- [Features](#features)

## Introduction

This is an E-commerce website built using Nodejs and Express as the backend and views created by EJS(embedded javascript) 
and MongoDB as the database.

The web app has a user side and an admin side. The admin side can be accessed by accessing the /admin route.

This application is hosted in AWS using Nginx as reverse proxy

URL: https://www.kromium.shop

## Demo

<div>
  <img src='demo.gif' />
</div>

## How-to-run

To run this project on your local environment you have to first run the command `npm install`

After that you have create a .env file in the root directory

Then add the following variables in the .env file

- PORT = your port number
- SECRET_KEY = a random secret key used for hashing the session using HMAC
- AUTHORIZATION_KEY = authorization key obtained from fast2sms api
- MONGO_URL = connection string for mongodb database
- RAZORPAY_KEY_ID = key id obtained from razorpay api
- RAZORPAY_SECRET_KEY = secret key obtained from razorpay api
- NODEMAILER_EMAIL = an email id for sending emails to users when the access the forgot password page 
(you have visit the security section of your google account, enable 2FA and then create an app password to use gmail with nodemailer)
- NODEMAILER_PASSWORD = app password for the above email id


After that run `npm run devStart` in the terminal to run the project (you need nodemon installed to run the app using this command. Otherwise run `node app.js`)

In mongoDB a database named kroma will be created. In kroma database their is a collection named admins. Add the following credentials of admin in that database using mongoDBCompass or mongosh.
  - email: email of admin
  - password: password for admin

eg: 
`db.collection.insertOne({email: 'your email here', password: 'your password here'})`

## Technology

This application is built with:
- Node.js
- Express.js
- MongoDB
- EJS view engine
- Bootstrap
- JQuery (Used only for datatables)
- Razorpay as payment gateway
- Fast2sms as sms API


## Features

This E-commerce app showcases different smartphones and smartphone accessories with different color and price variants

Users are able to do the following:

- Create an account with phone otp verificaton, login or logout, change password using 'forgot password'
- Edit their details in the user dashboard and add their address
- View available products that are added by the admin
- Search and filter products
- View product details with image zoom when hovering over product images
- Add products to shopping cart or wishlist
- Remove products from shopping cart or wishlist
- Increament or decrement product quantity in shopping cart
- Shift product to wishlist from cart and vice versa
- Proceed to checkout page if user has items in their cart
- Add coupons to reduce the total amount.
- Checkout the products with cash on delivery or razorpay payment methods
- Razorpay is running in test mode
- View order status in orders page in the dashboard
- Cancel order
- Download invoice for delivered products
- Return delivered products and recieve refund upon successful returns

Admin is able to do the following:

- Login and logout from admin panel
- View sales graph from admin dashboard
- Download sales report in excel or pdf format from the admin dashboard
- View all existing products
- Edit products
- Add new variants to existing products
- Delete variants of existing products
- Delete the entire product
- View all existing product categories
- Add new category
- Delete existing categories (Note that deleting a category will delete the entire products associated with that category)
- View all orders
- Change order status
- Cancel order
- View all returns requested
- Accept or decline return requests
- Change status of accepted returns
- Issue refund by changing the status of return to 'refund initiated'
- View all users
- Block or unblock users
- View all banners which are shown in the website landing page
- Change banner
- Add or delete banners
- View all existing coupons
- Add or delete coupons (All coupons are automatically removed from the admin's and user's view once the expiration date is reached)
- Coupon can be added with an amount reduction or a percentage reduction of the total price.
- Add or remove offers to products
- Add or remove offers to categories

Note that all delete mentioned above are soft deletes, ie., the data is not actually removed from the database instead it an isDeleted flag is added to the documents.