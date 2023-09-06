import { Request, Response, Router } from 'express';
import toml from 'toml';
import path from 'path';
import fs from 'fs';

export const router = Router();

router.get('/:customer/:file', async (req: Request, resp: Response) => {
  try {
    const { customer, file } = req.params;

    const config = toml.parse(
      fs.readFileSync(path.join(`relatorios/${customer}/${file}.toml`), 'utf-8')
    );

    console.log(JSON.stringify(config, null, 2));

    resp.render('index');
    //resp.sendFile(path.join(__dirname + '/views/index.html'));
  } catch (error) {
    console.log(error);
    resp.send('deu ruim');
  }
});
