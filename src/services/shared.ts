/** Shared between the local API server and the client — no React Native imports. */

export const MOCK_OTP = "123456";

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string = "GENERIC",
    public status: number = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
