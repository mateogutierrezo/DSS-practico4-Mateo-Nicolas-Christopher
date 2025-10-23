export interface Invoice {
    id: string;
    userId: string;
    amount: number;
    dueDate: Date;
    status: string;
}