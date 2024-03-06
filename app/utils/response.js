export function sendResponse (res, statusCode, data, message) {
    return res.status(statusCode).json({ statusCode, data, message });
}
