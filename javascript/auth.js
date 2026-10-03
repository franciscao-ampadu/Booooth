// -------------------------------
// SUPABASE SETUP
// -------------------------------

const SUPABASE_URL = "https://idnqkipswunwvmxkxesk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbnFraXBzd3Vud3ZteGt4ZXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjY1NTcsImV4cCI6MjEwNjYwMjU1N30.l3pVMStlU0GzSejXMK-iLuUTiqwB8U_J3lB4mgLVs6E";

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