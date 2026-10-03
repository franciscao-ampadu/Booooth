// Login: pressing the shutter flashes the screen, then goes to the booth.
const form = document.getElementById("loginForm");
const camera = document.getElementById("camera");
const flash = document.getElementById("flash");
const shutter = document.getElementById("shutter");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (shutter.disabled) return;
  shutter.disabled = true;

  // TODO: replace with Supabase Auth, and only redirect on success.
  camera.classList.add("shooting");
  flash.classList.add("flash-in");

  setTimeout(() => {
    window.location.href = "booth.html";
  }, 700);
});

// If the user comes back with the browser's back button, reset the animation.
window.addEventListener("pageshow", () => {
  shutter.disabled = false;
  camera.classList.remove("shooting");
  flash.classList.remove("flash-in");
});