export default interface ITopupOrder {
    email: string;
    topupId: string;
    phoneNumber: string;
    senderName: string;
    budget: number;
    amount: number;
    cost: number;
    status: string;
    statusCode: number;
    seller: string;
    provider: string;

}