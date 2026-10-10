import axios from "axios";

export default axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    headers: {
        // Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
        "Accept": "application/json",
        "Content-Type": "multipart/form-data"
    }
})