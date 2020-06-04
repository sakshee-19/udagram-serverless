import {decode} from 'jsonwebtoken'
import {JwtToken} from './jwtToken'

export function getUserId(jwtToken: string): string {
    const decodedJwt = decode(jwtToken) as JwtToken
    console.log("decoded jwt token ", decodedJwt)

    return decodedJwt.sub
}