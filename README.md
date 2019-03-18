# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install packages present in package.json file
```
npm install 
```
- To start the application please run the below command
npm start

-  I have used express js for get and post endpoint call.

### API END POINT DOCUMENTATION
- There are 2 endpoints available as part of this exercise as mentioned below:-
- 1 Get
- 2 Post

- Note : root url http://localhost:8000/

- 1 Get
  - Title : To get block information by passing block height
  - URL : /block/:blockheight -->  :blockheight --> you need to pass blockheight ex:- /block/0
  - Method : Get
  - Response : If response is success it will return code as 200 and its content. 
  Ex:- 
  Status Code: 200 
  Response Body or Content: {
      "hash": "1307730184ca326774536c09bd39f2bc61dbbc20e4b4b46ac6ff24029b2c0979",
      "height": 0,
      "body": "First block in the chain - Genesis block",
      "time": "1552744819",
      "previousBlockHash": ""
  }

- 2 Post
  - Title : To post block information by passing data 
  - URL : /block
  - Method : post
  - Data Params : 
        {
            "body": "Testing block with test string data123"
        }
  - Response : If response is success it will return code as 200 and its content. 
  Ex:- 
  Status Code: 200 
  Response Body or Content: {
    "hash": "07694b090b8dd34cb5e3d40a4210e4d855ee3f5f653c052667930ca555e8eb02",
    "height": 1,
    "body": "Testing block with test string data123",
    "time": "1552736799",
    "previousBlockHash": "0a132cb2b84319c706c8ddcedb419c90721e768e9b237e43f2bbb5ce95db636d"
}