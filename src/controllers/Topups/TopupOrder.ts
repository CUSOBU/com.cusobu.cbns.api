import e, { Response, Request, NextFunction } from 'express';
import topupOrderService from '../../services/Topups/TopupOrder';
import Topup from '../../services/Topups/Topup';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { topupId, senderName, phoneNumber, budget, cost, amount } = req.body;
        const seller = req.headers.email ? req.headers.email.toString() : '';

        const topup = await Topup.getTopup(topupId);
        if (!topup) {
            return res.status(400).json({
                status: 'error',
                message: 'Topup not found'
            });
        }
        console.log('Topup', topup);
        const email = req.headers.email ? req.headers.email.toString() : '';

        if (!topupId || !senderName || !phoneNumber || !budget || !amount || !cost || !seller) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }
        const reponseService = await topupOrderService.create(email, topupId, senderName, phoneNumber, budget, cost, amount, seller);

        if (!reponseService) {
            return res.status(400).json({
                status: 'error',
                message: 'Error creating topup order'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Topup order created successfully',
            data: reponseService
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: `Error creating topup order (${error})`
        });
    }
};

const patchTopupOrder = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const params = req.body;

    console.log('id', id);
    console.log('params', params);

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
        const topupOrder = await topupOrderService.patchTopupOrder(id, params);
        if (!topupOrder) {
            return res.status(400).json({
                status: 'error',
                message: 'Error updating topup orders'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Topup order updated successfully',
            data: topupOrder
        });
    }catch (error) {
        return res.status(400).json({
            status: 'error',
            message: `${error}`
        });
    }
};


const deleteTopupOrder = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required field "id"'
        });
    }
    try {
        const responseService = await topupOrderService.deleteTopupOrder(id);
        if (!responseService) {
            return res.status(404).json({
                status: 'error',
                message: 'Topup not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Topup Order deleted successfully',
            data: responseService
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: `${error}`
        });
    }
};

const filter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page = 1, pageSize = 20} = req.query;
        const status = req.body.status ? req.body.status : '';
        const startDate = req.body.startDate ? req.body.startDate : null;
        const endDate = req.body.endDate ? req.body.endDate : null;
        const phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : '';

        const responseService = await topupOrderService.filter(Number(page), Number(pageSize), status, startDate, endDate, phoneNumber);
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

const getTopupOrder = async (req: Request, res: Response, next: NextFunction) => {
    const id:string = req.params.id;
    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required field "id"'
        });
    }
    console.log('Deleting element ', id);
    try {
        const responseService = await topupOrderService.getTopupOrder(id);
        if (!responseService) {
            return res.status(404).json({
                status: 'error',
                message: 'Topup not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Topup retrieved successfully',
            data: responseService
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: `${error}`
        });
    }
};

const setStatus = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const status = req.body.status;
    const email = req.headers.email ? req.headers.email.toString() : ''; 
    console.log('id', id);
    console.log('status', status);
    console.log('email', email);
    
    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required field "id"'
        });
    }
    if (!status) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required field "status"'
        });
    }
    try {
        const responseService = await topupOrderService.setStatus(id, status, email);
        if (!responseService) {
            return res.status(404).json({
                status: 'error',
                message: 'Topup not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Topup status updated successfully',
            data: responseService
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: `${error}`
        });
    }
};

export default {
    create,
    patchTopupOrder,
    deleteTopupOrder,
    filter,
    getTopupOrder,
    setStatus
};
