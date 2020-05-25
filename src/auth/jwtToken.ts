// interface to define jwt token fields
export interface JwtToken{
    iss: string,
    sub: string,
    iat: string,
    exp: string
}