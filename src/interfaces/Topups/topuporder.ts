export default interface ITopupOrder {
    topupId: string;
    phoneNumber: string;
    senderName: string;
    budget: number;
    amount: number;
    status: string;
    statusCode: number;
    seller: string;
    provider: string;

}