# GU Price

### A Price Comparison Website of G.U.
- Display the historical price difference on various products
- Receive notifications through subscriptions when specials are available
- Search for similar products by image

Website URL: https://www.gu-price.com

## Table of Contents

- [Architecture](#Architecture)
- [Database Schema](#Database-Schema)
- [Technologies](#Technologies)
- [Features](#Features)
- [Testing Account](#Testing-Account)
- [Demonstration](#Demonstration)
    - [Home page](#Home-page)
    - [Product page](#Product-page)
    - [Profile page](#Profile-page)
    - [Responsive Web Design](#Responsive-Web-Design)
- [Contact](#Contact)

## Architecture

![image](https://i.imgur.com/3f15HOX.png)
- Redirect 443 port requests by **NGINX** after receiving request from clients
- Scrape product contents through **Web Crawler**
- Create and manage the product sets via **Google Cloud Vision**
- Store reference images in **Google Cloud Storage**

## Database Schema

![image](https://i.imgur.com/joOv5d0.png)

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
- RWD

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
- CI / CD: Jenkins, Docker
- Test: Mocha, Chai, Artillery
- Agile: Trello (Scrum)

### Others
- Design Pattern: MVC
- Web Crawler: Puppeteer, Cheerio
- Reverse Image Search: Google Cloud Vision
- Third Party Login: Facebook, Google

## Features

- Price Compare
    - Display the historical price difference on various products
- Product Track
    - Receive notifications through subscriptions when specials are available
- Reverse Image Search
    - Search for similar products by image

## Testing Account

- Email: test@test.com
- Password: test

## Demonstration

### Home page

- Search products by keyword

![image](https://i.imgur.com/daGEVOy.gif)

- Search products by image

![image](https://i.imgur.com/l45wmby.gif)

### Product page

- Display historical price and details of product

![image](https://i.imgur.com/oNl3tvC.gif)

### Profile page

- List the favorite and tracking products

![image](https://i.imgur.com/D1rRh9n.gif)

### Responsive Web Design

- Provide RWD for all screen sizes

| ![image](https://i.imgur.com/U6J59Vn.png) |
| ----------------------------------------- |

| ![image](https://i.imgur.com/zhlBCoX.png) | ![image](https://i.imgur.com/4AuIq7C.png)|
| ----------------------------------------- | ---------------------------------------- |

## Contact

Email: gu.price.search@gmail.com