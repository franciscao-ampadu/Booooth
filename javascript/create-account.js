// Create account: pressing the shutter flashes the screen, then goes to the booth.
const form = document.getElementById("signupForm");
const camera = document.getElementById("camera");
const flash = document.getElementById("flash");
const shutter = document.getElementById("shutter");
const shuttersound = new Audio("sounds/login-shutter.mp3");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (shutter.disabled) return;
  shutter.disabled = true;

  shuttersound.currentTime = 0;
  shuttersound.play();

  // TODO: replace with Supabase Auth signUp, and only redirect on success.
  const data = new FormData(form);
  const username = data.get("username");
  const email = data.get("email");
  const password = data.get("password");

  camera.classList.add("shooting");
  flash.classList.add("flash-in");

  setTimeout(() => {
    window.location.href = "booth.html";
  }, 700);
});

// Reset the animation if the user comes back with the browser's back button.
window.addEventListener("pageshow", () => {
  shutter.disabled = false;
  camera.classList.remove("shooting");
  flash.classList.remove("flash-in");
});