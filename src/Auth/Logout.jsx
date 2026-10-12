export default function Logout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    return null;
}