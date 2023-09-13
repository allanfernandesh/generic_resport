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

      const promises: { index: number; pos: number; promise: unknown }[] = [];

      config.button.forEach((btn) => {
        btn.deps.sort();
        btn.disabled = 'disabled';
      });

      let i = 0;
      config.field.forEach(async (element, index) => {
        //Para manter sempre as dependencias em ordem alfabetica, não mexa!
        element.deps.sort();

        if (!element.deps.length && !element.data?.length) {
          promises.push({
            index: i,
            pos: index,
            promise: ReportRepository.executeQuery(element.query),
          });

          i++;
        } else if (element.deps.length) {
          element.disabled = 'disabled';
        }
      });

      const data = await Promise.all(promises.map((item: any) => item.promise));

      promises.forEach((item) => {
        const options: unknown[] = [];

        data[item.index].forEach(
          (obj: { [s: string]: unknown } | ArrayLike<unknown>) =>
            Object.values(obj).forEach((value) => {
              options.push({
                label: value,
                value: value,
              });
            })
        );

        config.field[item.pos].data = options;
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

    const dataFilled: any[] = [];

    config.field.forEach(async (element) => {
      if (
        element.deps.sort().toString() === filled.sort().toString() &&
        !element.data?.length
      ) {
        promises.push({
          key: element.key,
          promise: ReportRepository.executeQuery(element.query, values),
        });
      } else if (element.data?.length && !filled.includes(element.key)) {
        dataFilled.push({
          key: element.key,
          value: element.data,
        });
      }
    });

    const data = await Promise.all(promises.map((item: any) => item.promise));

    const result = data
      .map((item, index) => ({
        key: promises[index].key,
        value: item,
      }))
      .concat(dataFilled);

    response.json(result);
  }
}

export default new ReportController();
