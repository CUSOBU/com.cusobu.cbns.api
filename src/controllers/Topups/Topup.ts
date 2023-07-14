import e, { Response, Request, NextFunction } from 'express';
import topupService from '../../services/Topups/Topup';
import { param } from '@src/routes/User';

const create = async (req: Request, res: Response, next: NextFunction) => {
    const { header, description, price, cost, amount } = req.body;

    if (!header || !description || !price || !cost || !amount) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
        });
    }
    try {
        const reponseService = await topupService.create(header, description, price, cost, amount);

        return res.status(200).json({
            status: 'success',
            message: 'Topup created successfully',
            data: reponseService
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Error creating topup'
        });
    }
};

const patchTopup = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const params = req.body;

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required field "id"'
        });
    }
    if (req.body.length == 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
        });
    }

    try {
        const responseService = await topupService.patchTopup(id, params);
        if (!responseService) {
            return res.status(404).json({
                status: 'error',
                message: 'Topup not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Topup updated successfully',
            data: responseService
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Error updating topup'
        });
    }
};

const deleteTopup = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required field "id"'
        });
    }
    try {
        const responseService = await topupService.deleteTopup(id);
        if (!responseService) {
            return res.status(404).json({
                status: 'error',
                message: 'Topup not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Topup deleted successfully',
            data: responseService
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Error retrieving topups'
        });
    }
};

const getTopups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page = 1, pageSize = 20 } = req.query;
        const responseService = await topupService.getTopups(Number(page), Number(pageSize));
        return res.status(200).json({
            status: 'success',
            message: 'Topups retrieved successfully',
            ...responseService
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Error retrieving topups'
        });
    }
};

export default {
    create,
    patchTopup,
    deleteTopup,
    getTopups
};
