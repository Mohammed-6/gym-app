import Cookies from "js-cookie";

const TOKEN_COOKIE = "gym_token";

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function setToken(token: string) {
  Cookies.set(TOKEN_COOKIE, token, { expires: 7, sameSite: "lax" });
}

export function clearToken() {
  Cookies.remove(TOKEN_COOKIE);
}
