export default interface UserInterface{
    id: string,
    name: string,
    last_name: string,
    user_name: string,
    user_icon?: string,
    email: string,
    phone_number: string,
    age: number,
    gender: string,
    interests: string[],
    created_at: Date
}