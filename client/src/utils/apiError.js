/**
 * Every place that catches an API error (thunks, components) gets the
 * same shape back: { status, message, details }. Saves every caller
 * from having to know axios's error.response.data.message nesting.
 */
export function normalizeApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    return {
      status,
      message: data?.message || 'Something went wrong. Please try again.',
      details: data?.details ?? null,
    };
  }
  if (error.request) {
    return { status: 0, message: 'Cannot reach the server. Check your connection.', details: null };
  }
  return { status: -1, message: error.message || 'Unexpected error', details: null };
}
