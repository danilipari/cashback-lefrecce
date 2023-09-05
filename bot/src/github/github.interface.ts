export interface UpdateFilePayload {
  token: string;
  repo: string;
  path: string;
  content: string;
  message: string;
}
