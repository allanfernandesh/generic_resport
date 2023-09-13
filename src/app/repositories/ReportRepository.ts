import { query } from '../../database/index';
class ReportRepository {
  async executeQuery(queryDB: string, params?: string[] | number[]) {
    return await query(queryDB.replace(/\\/g, ''), params);
  }
}

export default new ReportRepository();
