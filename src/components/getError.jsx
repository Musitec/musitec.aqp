const getErrorMessage = (error) => {
    const data = error?.response?.data
    if (!data) return "Error de red o servidor caído"
    if (typeof data.detail === "string") return data.detail
    if (typeof data.detail === "object" && data.detail.message)
        return data.detail.message
    if (Array.isArray(data.detail))
        return data.detail.map(e => e.msg).join(", ")
    if (data.message) return data.message
    if (data.error) return data.error
    return "Error inesperado"
}
export default getErrorMessage