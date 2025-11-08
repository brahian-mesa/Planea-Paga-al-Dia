export interface User {
    id?: String;
    name: String;
    email: String;
    password: String;
    created_at?: String;
}

export interface RegisterUser {
    name: String;
    email: String;
    password: String;
}

export interface LoginUser {
    email: String;
    password: String;
}

export interface UserResponse {
    user: User;
    token: String;
}
