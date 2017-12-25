const express = require('express');
const app = express();
//
const db = require('./server/mongo/mongoConnect');
//
const bodyParser = require('body-parser');
const path = require('path');
//
const userRoutes = require('./server/routing/userRoutes');
const adminRoutes = require('./server/routing/adminRoutes');


app.use(express.static('./client'));
app.use(bodyParser.json());

userRoutes(app);
adminRoutes(app);

app.get('*',(req, res) => {
	res.sendFile(path.join(__dirname + '/client/index.html'));
})

db.on('connected',function() {
	console.log('Connected to Mongo');
	app.listen(process.env.PORT || 3000, () => {
		console.log('Listening on port 3000');
	})
});

db.on('error',function(err) {
	console.log(`MongoDB default connection error ${err}`);
})