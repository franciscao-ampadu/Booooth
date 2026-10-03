// -------------------------------
// SUPABASE SETUP
// -------------------------------

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// -------------------------------
// LOGIN PAGE ELEMENTS
// -------------------------------

const form = document.getElementById("loginForm");
const camera = document.getElementById("camera");
const flash = document.getElementById("flash");
const shutter = document.getElementById("shutter");
const loginError = document.getElementById("loginError");


// -------------------------------
// LOGIN
// -------------------------------

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (shutter.disabled) return;
    shutter.disabled = true;

    // Get email and password from the form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Clear previous error
    loginError.textContent = "";

    // Try logging into Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    // ❌ LOGIN FAILED
    if (error) {
        console.error("Login failed:", error.message);

        loginError.textContent = error.message;

        // Allow user to try again
        shutter.disabled = false;

        return;
    }

    // ✅ LOGIN SUCCESSFUL
    console.log("Logged in:", data.user);

    // Play your original camera animation
    camera.classList.add("shooting");
    flash.classList.add("flash-in");

    // Go to booth after animation
    setTimeout(() => {
        window.location.href = "booth.html";
    }, 700);
});


// -------------------------------
// RESET CAMERA
// -------------------------------

// If the user comes back with the browser's back button,
// reset the animation.
window.addEventListener("pageshow", () => {
    shutter.disabled = false;
    camera.classList.remove("shooting");
    flash.classList.remove("flash-in");
});