import Remittance from "../models/Remittance";

const getRemittances = async (params: any) => {
    const remittances = await Remittance.find(params);
    return remittances;
}

const getRemittancesByDate = async (params: any) => {
    const remittanceCounts = await Remittance.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 }, // Contar las remesas en cada fecha
          },
        },
        {
          $project: {
            date: "$_id",
            cant: "$count",
          },
        },
      ]);
  
    return remittanceCounts;
  };

const getRemittancesByStatus = async (params: any) => {
    const remittanceCountsByState = await Remittance.aggregate([
        {
          $match: params, // Filtrar las remesas según los parámetros proporcionados
        },
        {
          $group: {
            _id: "$status", // Agrupar por estado
            count: { $sum: 1 }, // Contar las remesas en cada estado
            totalAmount: { $sum: 1 },
          },
        },
        {
            $group: {
              _id: null, // No agrupar por ningún campo
              total: { $sum: "$count" }, // Calcular la suma de la cantidad de remesas en todos los estados
              states: { $push: { state: "$_id", count: "$count" } }, // Guardar los resultados por estado en un arreglo
            },
          },
      ]);
    
      return remittanceCountsByState;
  };


export default {
    getRemittances,
    getRemittancesByDate,
    getRemittancesByStatus
}
