const express = require("express")
const redis = require("redis")
const axios = require('axios');
const app = express()

let PORT = 5001
let REDIS_PORT = 6379
const client = redis.createClient(REDIS_PORT)

function setResponse(username, repos) {
    console.log(username)
    return `<h2>${username} has ${repos} github repos</h2>`
}

async function getPosts(req, res, next) {

    let username = req.params.username; // specify the parameter name to get the value
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        // console.log(username);
        // console.log(response.data.public_repos);
        let repos = response.data.public_repos

        client.setex(username, 3600, repos.toString());
        res.send(setResponse(username, repos));
        // res.send(response.data);
    } catch (error) {
        console.error(error);
    }
}

function cache(req, res, next) {
    const { username } = req.params

    client.get(username, (err, data) => {
        if (err) throw err;
        if (data !== null) {
            res.send(setResponse(username, data))
        } else {
            next()
        }
    })

}
app.get("/repos/:username", cache, getPosts)


app.listen(PORT, () => {
    console.log(`working with ${PORT}`)
})
