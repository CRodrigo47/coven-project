export interface GuestInterface{
    user_id: string,
    gathering_id: string,
    expenses?: number,
    remarks?: string,
    arriving_status?: string
}

export interface GuestWithUserIcon{
    arriving_status: string
    user_id: string;
    gathering_id: string;
    expenses?: number,
    remarks?: string,
    user: UserProfile;
};

export interface UserProfile{
    user_icon?: string;
    user_name: string;
  };
  
