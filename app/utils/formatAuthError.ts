export function formatAuthError(errorMessage: string) {
  const errorDetails = JSON.parse(errorMessage);

  const issues: Record<string, string> = {};

  errorDetails.forEach((errorDetail: { path: string[]; message: string }) => {
    issues[errorDetail.path[0]] = errorDetail.message;
  });

  return issues;
}
