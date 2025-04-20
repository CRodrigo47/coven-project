export default interface GatheringInterface{
    id: string,
    name: string,
    location_name: string,
    location_latitude?: number,
    location_length?: number,
    date: string,
    time: string,
    transport?: string,
    cost?: number,
    meal?: string,
    extra_info?: string,
    description: string,
    tags?: string[],
    advertisement?: string,
    created_at: string,
    coven_id: string,
    creator_id?: string
}