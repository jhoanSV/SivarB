import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import { options } from './SwaggerOptions';


const specs = swaggerJSDoc(options)

import tasksRoutes from './routes/tasks';

// * try the HTTPS request
/*const https = require('https');
const path = require('path');
const fs = require('fs');

const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
},app
)

sslServer.listen(443, () => console.log('server listening on port 443'))*/
// * try the HTTPS request

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(tasksRoutes)

app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs) )


export default app