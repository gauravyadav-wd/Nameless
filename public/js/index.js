import { login } from "./login";
import { logout } from "./login";

const loginForm = document.querySelector(".loginform");
const logOutBtn = document.querySelector(".logout");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector(".email").value;
    const password = document.querySelector(".password").value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", logout);
}
