interface ApiError {
  data: { errors: { code: string; message: string; data?: any }[] };
  status: number;
}
