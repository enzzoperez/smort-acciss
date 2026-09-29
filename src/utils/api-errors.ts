export function isPinDisabledError(error: unknown): boolean {
  return (error as ApiError)?.status === 422;
}
