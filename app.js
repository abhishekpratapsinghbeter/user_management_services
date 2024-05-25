const dotenv = require("dotenv")
const express =require('express')
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const app = express();
const cors = require('cors');

dotenv.config({path:'./config.env'})
require("./src/models/connection/conn")
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(require('./src/routes/userroutes/classroutes'));
app.use(require('./src/routes/userroutes/subjectroutes'));
app.use(require('./src/routes/userroutes/studentroutes'));
app.use(require('./src/routes/userroutes/teacher'));
const PORT = process.env.PORT || 5005;
  
app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})