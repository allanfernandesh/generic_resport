import { Router } from 'express';
import ReportController from './app/controllers/ReportController';

export const router = Router();

router.get('/:customer/:file', ReportController.getConfig);

router.post('/:customer/:file', ReportController.sendData);
