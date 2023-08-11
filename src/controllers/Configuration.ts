import { Response, Request, NextFunction } from 'express';
import configurationService from '../services/Configuration';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ error: 'Missing parameters' });
        }
        const config = await configurationService.addConfiguration(key, value);

        if (!config) {
            return res.status(400).json({ error: 'Error creating configuration (${key})' });
        }
        return res.status(201).json({ 
            status: 'success',
            message: 'Configuration created successfully',
            data: config 
        });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while saving the configuration.' });
    }
};

const getConfigurations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const configurations = await configurationService.getConfigurations(req.body);
        return res.status(200).json({ 
            status: 'success',
            message: 'Configurations retrieved successfully',
            data: configurations });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while getting the configurations.' });
    }
};

const getConfigurationByKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const configuration = await configurationService.getConfigurationByKey(req.params.key);
        return res.status(200).json({ 
            status: 'success',
            message: 'Configuration retrieved successfully',
            data: configuration });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while getting the configuration.' });
    }
};

const updateConfiguration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ error: 'Missing parameters' });
        }
        const config = await configurationService.updateConfiguration(key, value);

        if (!config) {
            return res.status(400).json({ error: 'Error updating configuration (${key})' });
        }
        return res.status(201).json({ 
            status: 'success',
            message: 'Configuration updated successfully',
            data: config });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while updating the configuration.' });
    }
};

const deleteConfiguration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const configuration = await configurationService.deleteConfiguration(req.params.key);
        return res.status(200).json({ 
            status: 'success',
            message: 'Configuration deleted successfully',
            data: configuration });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while deleting the configuration.' });
    }
};

export default {
    create,
    getConfigurations,
    getConfigurationByKey,
    updateConfiguration,
    deleteConfiguration,
    
};