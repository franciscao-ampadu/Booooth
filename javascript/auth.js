// -------------------------------
// LOGIN PAGE ELEMENTS
// -------------------------------

const form = document.getElementById("loginForm");
const camera = document.getElementById("camera");
const flash = document.getElementById("flash");
const shutter = document.getElementById("shutter");
const loginError = document.getElementById("loginError");
const googleLogin = document.getElementById("googleLogin");


// -------------------------------
// EMAIL + PASSWORD LOGIN
// -------------------------------

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    // Prevent multiple login attempts
    if (shutter.disabled) return;

    shutter.disabled = true;

    // Get email and password
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Clear previous error
    loginError.textContent = "";


    // -------------------------------
    // LOGIN WITH SUPABASE
    // -------------------------------

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


    // -------------------------------
    // LOGIN FAILED
    // -------------------------------

    if (error) {

        console.error(
            "Login failed:",
            error.message
        );

        loginError.textContent = error.message;

        // Allow another attempt
        shutter.disabled = false;

        return;
    }


    // -------------------------------
    // LOGIN SUCCESSFUL
    // -------------------------------

    console.log(
        "Logged in:",
        data.user
    );


    // Play camera animation
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