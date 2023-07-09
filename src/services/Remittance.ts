import Remittance from '../models/Remittance';

const getRemittances = async (params: any) => {
    const remittances = await Remittance.find(params);
    return remittances;
};

const getRemittancesByDate = async (params: any) => {
    const remittanceCounts = await Remittance.aggregate([
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

    return remittanceCounts;
};

const getRemittancesByStatus = async (params: any) => {
    const remittanceCountsByState = await Remittance.aggregate([
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

    return remittanceCountsByState;
};

export default {
    getRemittances,
    getRemittancesByDate,
    getRemittancesByStatus
};







