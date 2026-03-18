import { AxiosInstance } from "axios"

import { User } from "./types"

export class AuthService {
  constructor(private http: AxiosInstance) {}

  async login(email: string, password: string, includeBodyToken = true): Promise<User> {
    const res = await this.http.post("/auth/login?includeBodyToken=" + includeBodyToken, {
      email,
      password,
    })
    return res.data
  }

  async signUp(email: string, name: string, password: string): Promise<User> {
    const res = await this.http.post("/auth/sign-up", {
      email,
      name,
      password,
    })
    return res.data
  }

  async logout(): Promise<void> {
    await this.http.post("/auth/logout")
  }

  async getAuthenticatedUser(): Promise<User> {
    const res = await this.http.post("/auth/get-authenticated-user-info")
    return res.data
  }
}
