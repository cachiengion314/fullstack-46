// npm init -y: auto asign all entry for initialize node package manager
// framework bigger than libery, express is a framework to build backend system. (Nginx, Apache, NodeJS)
// npm init : create local npm
console.log(`---server.js---`);
require(`dotenv`).config();
const express = require(`express`);
const fs = require(`fs`);
const app = express();
const path = require(`path`); // giải quyết vấn để conflict đường dẫn giữa các OS
const PORT = process.env.PORT || 8000;

// config cho client gửi lên với header application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: true }));
// config cho client gửi lên với header 'Content-Type': 'application/json'
app.use(express.json());
app.use(`/public`, express.static(`public`));

app.get(`/`, (request, response) => {
    response.redirect(`public`);
});

app.get(`/allquestionindata`, (request, response) => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync('./data.json'));
    } catch (err) {
        data = [];
    }
    response.send(JSON.stringify(data));
});

app.get(`/data`, (request, response) => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync('./data.json'));
    } catch (err) {
        data = [];
    }
    let randomNumber = Math.floor(Math.random() * (data.length - 0)) + 0;
    let randomQuestion = data[randomNumber];
    response.send(JSON.stringify(randomQuestion));
});

app.put(`/add-vote/:questionid`, (request, response) => {
    const { questionid } = request.params;
    const { type } = request.body;
    console.log(`type:`, type, `questionid:`, questionid);
    let data;
    try {
        data = JSON.parse(fs.readFileSync('./data.json'));
    } catch (err) {
        data = [];
    }
    const foundQuestion = data.find(question => {
        const sameId = parseInt(question._id) === parseInt(questionid);
        return sameId;
    });

    if (type === `yes` || type === `no`) {
        foundQuestion[type]++;
    }
    data[data.indexOf(foundQuestion)] = foundQuestion;
    fs.writeFileSync(`./data.json`, JSON.stringify(data));

    if (foundQuestion) {
        return response.send({
            success: 1,
            data: foundQuestion,
        });
    }
});

app.post(`/create-question`, (request, response) => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync('data.json'));
    } catch (err) {
        data = [];
    }
    const newQuestion = {
        _id: data.length + 1,
        content: request.body.content,
        yes: 0,
        no: 0,
    }

    console.log(request.body);
    let newData = [...data, newQuestion];
    fs.writeFileSync(`data.json`, JSON.stringify(newData));
    response.send({
        success: 1,
        data: newQuestion,
    });
});

app.get(`/*`, (request, response) => {
    // give client 404 page when user write wrong direction
    response.sendFile(path.resolve(__dirname, `public`, `page404`, `page404.html`));
});

app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Server started at ${PORT}`);
});