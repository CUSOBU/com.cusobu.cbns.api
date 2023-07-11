export default interface IBalance {
    email: string;
    operational_price: number;
    customer_price: number;
    balance_usd: number;
    balance_uyu: number;
    operational_limit:number;
    pre_paid: boolean;
    allow_overlimit: boolean;
    last_update: Date;
}