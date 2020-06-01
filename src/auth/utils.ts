import {decode} from 'jsonwebtoken'
import {JwtToken} from './jwtToken'

export function getUserId(jwtToken: string): string {
    const result = decode(jwtToken) as JwtToken
    console.log("decoded jwt token ", result)

    return result.sub
}