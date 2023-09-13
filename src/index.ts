import express from 'express';

import { engine } from 'express-handlebars';
import { router } from './router';
import path from 'path';

const app = express();

const PORT = process.env.PORT || 3000;

app.use('/public', express.static(path.join(__dirname, '/public')));

//Configurações do HandleBars
app.engine('hbs', engine({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'app', 'views'));

app.use(express.json());
app.use(router);

app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
