import { Request, Response } from 'express';
import ReportRepository from '../repositories/ReportRepository';
import toml from 'toml';
import path from 'path';
import fs from 'fs';
import { TomlType } from '../interfaces/toml';

class ReportController {
  async getConfig(request: Request, response: Response) {
    try {
      const { customer, file } = request.params;

      const config: TomlType = toml.parse(
        fs.readFileSync(
          path.join(`relatorios/${customer}/${file}.toml`),
          'utf-8'
        )
      );

      const promises: { index: number; promise: unknown }[] = [];

      config.button.forEach((btn) => {
        btn.deps.sort();
        btn.disabled = 'disabled';
      });

      config.field.forEach(async (element, index) => {
        //Para manter sempre as dependencias em ordem alfabetica, não mexa!
        element.deps.sort();

        if (!element.deps.length) {
          promises.push({
            index: index,
            promise: ReportRepository.executeQuery(element.query),
          });
        } else {
          element.disabled = 'disabled';
        }
      });

      const data = await Promise.all(promises.map((item: any) => item.promise));

      promises.forEach((item) => {
        config.field[item.index].data = data[item.index].map(
          (item: object) => ({
            label: Object.values(item)[0],
            value: Object.values(item)[0],
          })
        );
      });

      response.render('index', config);
    } catch (err) {
      console.log(err);
    }
  }

  async sendData(request: Request, response: Response) {
    const { customer, file } = request.params;

    const { values, filled } = request.body;

    const config: TomlType = toml.parse(
      fs.readFileSync(path.join(`relatorios/${customer}/${file}.toml`), 'utf-8')
    );

    const promises: { key: string; promise: unknown }[] = [];

    config.field.forEach(async (element) => {
      if (element.deps.sort().toString() === filled.sort().toString()) {
        promises.push({
          key: element.key,
          promise: ReportRepository.executeQuery(element.query, values),
        });
      }
    });

    const data = await Promise.all(promises.map((item: any) => item.promise));

    const result = data.map((item, index) => ({
      key: promises[index].key,
      value: item,
    }));

    response.json(result);
  }
}

export default new ReportController();
