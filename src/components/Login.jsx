import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { BsEye, BsEyeSlash } from "react-icons/bs"; // Import icons for show/hide
import Footer from "./Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  
  const navigate = useNavigate();

   // Email and Password Validation
   const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
   const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateEmail(email)) {
      setError("Invalid email format!");
      return;
    }
    
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long, include 1 uppercase, 1 lowercase, 1 digit, and 1 special character.");
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          firstName: firstName,
          lastName: lastName,
          email: email.toLowerCase(),
          createdAt: new Date(),
        });

        setIsSignUp(false); // Redirect user to login after signup
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/chat");
      }
    } catch (error) {
      setError(error.message);
      console.error("Auth Error:", error.message);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      setError("Failed to send password reset email. Please try again.");
      console.error("Forgot Password Error:", error.message);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Section - Welcome Message & Image */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#6E00FF] text-white p-10">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome to ChatWise</h1>
        <p className="text-lg text-center mb-6">Connect with people instantly and enjoy real-time chat!</p>
        <img src="/chatWise_login.png" alt="Chat Illustration" className="w-40 md:w-72 h-auto" />
        <div className="flex justify-center">
        <p className="text-sm mr-2">&copy; {new Date().getFullYear()} chatWise</p>
            <a
                href="https://github.com/your-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm hover:text-gray-400 transition"
                >
              <FontAwesomeIcon icon={faGithub} />
            </a>
        </div>
        
             
      </div>

      {/* Right Section - Login/Signup Form */}
      <div className="flex justify-center items-center w-full md:w-1/2 p-8">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
          <h2 className="text-3xl font-semibold text-center text-[#6E00FF] mb-5">
            {isSignUp ? "Sign Up" : forgotPassword ? "Reset Password" : "Login"}
          </h2>

          {/* Forgot Password Section */}
          {forgotPassword ? (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6E00FF]"
              />
              <button
                type="button"
                onClick={handleForgotPassword}
                className="bg-[#6E00FF] hover:bg-[#8400ff] text-white p-3 rounded-lg mt-3 w-full transition"
              >
                Send Reset Email
              </button>
              {successMessage && <p className="mt-2 text-green-500 text-center">{successMessage}</p>}
              {error && <p className="mt-2 text-red-500 text-center">{error}</p>}
              <p className="text-[#6E00FF] cursor-pointer mt-3 text-center hover:underline" onClick={() => setForgotPassword(false)}>
                Back to Login
              </p>
            </>
          ) : (
            <>
              {/* Signup Fields */}
              {isSignUp && (
                <>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-1 focus:ring-[#6E00FF]"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-1 focus:ring-[#6E00FF]"
                  />
                </>
              )}

              {/* Email Field */}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-1 focus:ring-[#6E00FF]"
              />

              {/* Password Field with Toggle Button */}
              <div className="relative w-full mt-2">
                <input
                  type={showPassword ? "text" : "password"} // Toggle input type
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6E00FF]"
                />
                {/* Toggle Button for Show/Hide Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              {successMessage && <p className="text-green-500 text-sm mt-2 text-center">{successMessage}</p>}

              <button className="bg-[#6E00FF] hover:bg-[#8400ff] text-white p-3 rounded-lg mt-3 w-full transition">
                {isSignUp ? "Sign Up" : "Login"}
              </button>

              {!isSignUp && (
                <p className="text-[#6E00FF] cursor-pointer mt-3 text-center hover:underline" onClick={() => setForgotPassword(true)}>
                  Forgot Password?
                </p>
              )}

              <p className="mt-4 text-center text-sm">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <span onClick={() => { setIsSignUp(!isSignUp); setForgotPassword(false); }} className="text-[#6E00FF] cursor-pointer ml-1 hover:underline">
                  {isSignUp ? "Login" : "Sign Up"}
                </span>
              </p>
            </>
          )}
         
        </form>
        
      </div>
    </div>
   
  );
};

export default Login; 
