interface JwtPayload {
  roles: string[];
  userId: string;
  iat: number;
}

export const decodeJwt = (token: string): JwtPayload => {
  const base64Payload = token.split(".")[1];
  const payload = JSON.parse(atob(base64Payload));
  return payload;
};
