# GU Price

### A Price Comparison Website of G.U.
- Display the historical price difference on various products
- Receive notifications through subscriptions when specials are available
- Search for similar products by image

Website URL: https://www.gu-price.com/

## Table of Contents

- [Technologies](#Technologies)
- [Architecture](#Architecture)
- [Database Schema](#Database-Schema)
- [Data Pipeline](#Data-Pipeline)
- [Main Features](#Main-Features)
- [Demonstration](#Demonstration)
    - [Home page](#Home-page)
    - [News page](#News-page)
    - [Compare page](#Compare-page)
    - [Hots page](#Hots-page)
- [Contact](#Contact)

## Technologies

### Backend
- Node.js / Express.js
- RESTful API
- NGINX

### Front-End
- HTML
- CSS
- JavaScript
- Pug
- AJAX

### Cloud Service
- Compute: AWS EC2
- Storage: Google Cloud Storage (GCS)

### Database
- MySQL
- AWS RDS

### Networking
- HTTP & HTTPS
- Domain Name System (DNS)
- SSL Certificate (Let's Encrypt)

### Tools
- Version Control: Git, GitHub
- Agile: Trello (Scrum)

### Others
- Design Pattern: MVC
- Web Crawler: puppeteer, cheerio
- Reverse Image Search: Google Cloud Vision

## Architecture

![](https://i.imgur.com/uhq0Yrk.png)
- Redirect 443 port requests by **NGINX** after receiving request from clients
- Scrape product contents through **Web Crawler**
- Create and manage the product sets via **Google Cloud Vision**
- Store reference images in **Google Cloud Storage**

## Database Schema

![](https://i.imgur.com/V6jfhX0.png)

## Features

- Price Compare
    - Display the historical price difference on various products
- Product Track
    - Receive notifications through subscriptions when specials are available
- Reverse Image Search
    - Search for similar products by image

## Demonstration

## Contact

Email: gu.price.search@gmail.com