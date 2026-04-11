export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode = 400,
    public readonly details?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
