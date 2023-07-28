export default interface IProviderBalance {
    email: string;
    operational_price: number;
    balance_mlc: number;
    balance_cup: number;
    operational_limit:number;
    pre_paid: boolean;
    allow_overlimit: boolean;
    last_update: Date;
    topups_rate: number;
    topups_rate_type: string;
}