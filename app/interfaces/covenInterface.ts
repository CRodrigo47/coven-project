export default interface CovenInterface{
    id: string,
    name: string,
    coven_icon?: string,
    description?: string,
    is_public: boolean,
    created_at: Date,
    created_by?: string,
}