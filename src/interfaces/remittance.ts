export default interface IRemittance {
    user_email: string;
    cardNumber: string;
    full_name: string;
    phone_number: string;
    amount: number;
    currency: string;
    budget: number;
    budget_currency: string;
    source_reference: string;
    process_status: string;
}