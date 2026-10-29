import { request } from "./apiClient";
import { localApi } from "./localApi";
import type { UploadResponse } from "@/types";

export const uploadsApi = {
  /** POST /uploads */
  async upload(input: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    ownerEntityType: string;
    ownerEntityId: string;
    restaurantId?: string;
  }): Promise<UploadResponse> {
    return request("/uploads", { method: "POST", body: input }, () => localApi.upload(input));
  },
};
