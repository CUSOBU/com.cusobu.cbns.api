import Remittance from '../models/Remittance';

const getRemittances = async (params: any) => {
    return Remittance.find(params);
};

const getRemittancesByDate = async (params: any) => {
    return  Remittance.aggregate([
        {
            $match: params // Filtrar las remesas según los parámetros proporcionados
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt'
                    }
                },
                count: { $sum: 1 } // Contar las remesas en cada fecha
            }
        },
        {
            $project: {
                date: '$_id',
                cant: '$count'
            }
        }
    ]);
};

const getRemittancesByStatus = async (params: any) => {
    return  Remittance.aggregate([
        {
            $match: params // Filtrar las remesas según los parámetros proporcionados
        },
        {
            $group: {
                _id: '$status', // Agrupar por estado
                count: { $sum: 1 } // Contar las remesas en cada estado
            }
        },
        {
            $project: {
                _id: 0,
                state: '$_id',
                count: 1
            }
        }
    ]);
};

export default {
    getRemittances,
    getRemittancesByDate,
    getRemittancesByStatus
};







