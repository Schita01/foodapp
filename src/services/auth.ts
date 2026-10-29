import { request } from "./apiClient";
import { localApi } from "./localApi";

export { MOCK_OTP } from "./shared";

export const authApi = {
  /** POST /auth/email/start */
  async emailStart(email: string): Promise<{ isExisting: boolean; resendInSec: number }> {
    return request("/auth/email/start", { method: "POST", body: { email } }, () =>
      localApi.authEmailStart(email),
    );
  },

  /** POST /auth/email/verify */
  async emailVerify(
    email: string,
    code: string,
  ): Promise<{ token: string; customerId: string; accountStatus: "active" | "blocked" }> {
    return request("/auth/email/verify", { method: "POST", body: { email, code } }, () =>
      localApi.authEmailVerify(email, code),
    );
  },

  /** POST /auth/logout */
  async logout(): Promise<{ ok: true }> {
    return request("/auth/logout", { method: "POST" }, () => localApi.logout());
  },
};
