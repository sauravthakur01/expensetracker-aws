const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const cors = require('cors');
const helmet = require("helmet");
const compression = require('compression')
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
// const https = require('https');


const accessLogStream = fs.createWriteStream('access.log', {flag: 'a'})

const User = require('./models/user');
const Expense = require('./models/expense');
const Order =require('./models/order');
const Forgotpassword = require('./models/forgotpassword');
const Downloadurl = require('./models/downloadurls');

const userRouter = require('./routes/user');
const expenseRouter =require('./routes/expense');
const purchaseRouter = require('./routes/purchase')
const forgetpassRouter = require('./routes/forgetpass')

// const privateKey = fs.readFileSync('server.key')
// const certificate = fs.readFileSync('server.cert'); 

app.use(express.json())

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json({extended:false}))

app.use('/user' , userRouter )
app.use('/expense' , expenseRouter )
app.use('/payment' , purchaseRouter)
app.use('/password' , forgetpassRouter)

Expense.belongsTo(User);
User.hasMany(Expense);

User.hasMany(Order);
Order.belongsTo(User);

Forgotpassword.belongsTo(User);
User.hasMany(Forgotpassword);

Downloadurl.belongsTo(User);
User.hasMany(Downloadurl);

sequelize.sync()
.then(()=>{
    // https.createServer({key : privateKey , cert: certificate} , app)
    app.listen(process.env.PORT || 3000 ,()=>{
        console.log('running');
    })
})
.catch(err=>{
    console.log(err)
})
    

