// Create account: create the user with Supabase,
// then play the shutter animation and enter the booth.

const form = document.getElementById("signupForm");
const camera = document.getElementById("camera");
const flash = document.getElementById("flash");
const shutter = document.getElementById("shutter");
const shuttersound = new Audio("sounds/login-shutter.mp3");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Stop user from clicking twice
    if (shutter.disabled) return;
    shutter.disabled = true;

    // Get the values from the form
    const formData = new FormData(form);

    const username = formData.get("username").trim();
    const email = formData.get("email").trim();
    const password = formData.get("password");

    // Create account with Supabase
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,

        options: {
            data: {
                username: username
            }
        }
    });

    // If account creation failed
    if (error) {
        console.error("Signup error:", error);

        alert(error.message);

        // Let the user try again
        shutter.disabled = false;
        return;
    }

    // Account was created successfully
    console.log("Account created:", data);

    // Play shutter sound
    shuttersound.currentTime = 0;
    shuttersound.play();

    // Camera animation
    camera.classList.add("shooting");
    flash.classList.add("flash-in");

    // Go to booth
    setTimeout(() => {
        window.location.href = "booth.html";
    }, 700);
});


// Reset animation if user comes back using browser back button
window.addEventListener("pageshow", () => {
    shutter.disabled = false;
    camera.classList.remove("shooting");
    flash.classList.remove("flash-in");
});