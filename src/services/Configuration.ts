import Configuration from "../models/Configuration";

const getConfigurations = async (params: any) => {
    try {
        const configuration = await Configuration.find(params);
        if (!configuration) {
            throw new Error('Configuration does not exist');
        }
        return configuration;
    } catch (err) {
        throw new Error("Configuration does not exist");
    }
};

const getConfigurationByKey = async (key: string) => {
    try {
        const configuration = await Configuration.findOne({key: key});
        if (!configuration) {
            throw new Error('Configuration does not exist');
        }
        return configuration;
    } catch (err) {
        throw new Error("Configuration does not exist");
    }
};

const getValue = async (key: string) => {
    try {
        const configuration = await Configuration.findOne({key: key});
        if (!configuration) {
            throw new Error('Configuration does not exist');
        }
        return configuration.value;
    } catch (err) {
        throw new Error("Configuration does not exist");
    }
};

const addConfiguration = async (key: string, value: string) => {
    const Conf = new Configuration({key: key, value: value});
    try {
        return await Conf.save();
    } catch (err) {
        throw new Error("Error saving configuration");
    }
};

const updateConfiguration = async (key: string, value: string) => {
    try {
        const configuration = Configuration.findOneAndUpdate({key: key}, {value: value}, {new: true});
    if (!configuration) {
        throw new Error("Configuration does not exist");
    }
    return configuration;
    } catch (error) {
        throw new Error("Error updating configuration");
    }
};

const deleteConfiguration = async (key: string) => {
    try {
        const configuration = Configuration.findOneAndDelete({key: key});
        if (!configuration) {
            throw new Error("Configuration does not exist");
        }
        return configuration;
    } catch (error) {
        throw new Error("Error deleting configuration");
    }
};

export default {
    getConfigurations,
    getConfigurationByKey,
    getValue,
    addConfiguration,
    updateConfiguration,
    deleteConfiguration
}