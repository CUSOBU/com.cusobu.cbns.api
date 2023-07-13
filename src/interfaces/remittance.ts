export default interface IRemittance {
    email: string;
    full_name: string;
    phone_number: string;
    cardNumber: string;
    remittance_amount: number;
    remittance_currency: string;
    budget_amount: number;
    operation_cost: number;
    budget_currency: string;
    source_reference: string;
    status: string;
    statusCode: string;
    webhook: string;
    evidence: string;
    details: string;
    provider: string;
    remittance_rate:number
}