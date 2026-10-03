// -------------------------------
// LOGIN PAGE ELEMENTS
// -------------------------------

const form = document.getElementById("loginForm");
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
  
  // TODO: replace with Supabase Auth, and only redirect on success.
  camera.classList.add("shooting");
  flash.classList.add("flash-in");


    // Redirect after camera animation
    setTimeout(() => {

        window.location.href = "booth.html";

    }, 700);

});


// -------------------------------
// GOOGLE LOGIN
// -------------------------------

googleLogin.addEventListener("click", async () => {

    // Prevent multiple clicks
    googleLogin.disabled = true;

    // Clear previous error
    loginError.textContent = "";


    // Create the URL Google should return to
    const redirectURL =
        new URL("booth.html", window.location.href).href;


    // -------------------------------
    // LOGIN WITH GOOGLE
    // -------------------------------

    const { error } =
        await supabaseClient.auth.signInWithOAuth({

            provider: "google",

            options: {
                redirectTo: redirectURL
            }

        });


    // -------------------------------
    // GOOGLE LOGIN FAILED
    // -------------------------------

    if (error) {

        console.error(
            "Google login failed:",
            error.message
        );

        loginError.textContent = error.message;

        googleLogin.disabled = false;
    }

});


// -------------------------------
// RESET LOGIN PAGE
// -------------------------------

// If the user returns using the browser
// back button, reset the camera and buttons.

window.addEventListener("pageshow", () => {

    shutter.disabled = false;
    googleLogin.disabled = false;

    camera.classList.remove("shooting");
    flash.classList.remove("flash-in");

});