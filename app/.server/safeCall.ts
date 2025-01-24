export default async function safeCall<T>(functionCall: Promise<T>) {
  try {
    return await functionCall;
  } catch (err) {
    console.error("Safe call failed with", err);
    return null;
  }
}
