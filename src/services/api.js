import axios from "axios"
let sessionExpired = false
const api=axios.create({
    baseURL: "https://musitec-aqp.up.railway.app/api/",
    withCredentials: true
})
api.interceptors.request.use((config) => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    config.headers["X-Timezone"] = timezone
  } catch (e) {
    config.headers["X-Timezone"] = "UTC"
  }
  return config
})
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("auth/refresh")&&
      !sessionExpired
    ) {
      originalRequest._retry = true
      try {
        await api.post("auth/refresh/")
        return api(originalRequest)
      } catch (err) {
        sessionExpired=true
        localStorage.removeItem("user")
        window.location.replace("/")
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)
export default api