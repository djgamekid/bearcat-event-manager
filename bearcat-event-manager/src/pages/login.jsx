import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

function Login() {
    const navigate = useNavigate();
    const { login, error: authError, isAdmin, loading: authLoading, currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for email and password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // In login.jsx
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(email, password);
            // Don't redirect here - let useEffect handle it
        } catch (err) {
            setError(err.message || 'Failed to login');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

// Add this useEffect to handle redirection after successful login
    useEffect(() => {
        if (currentUser && !authLoading) {
            // User is authenticated and role check is complete
            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/user');
            }
        }
    }, [currentUser, authLoading, isAdmin, navigate]);

    // Show loading state while checking role
    if (authLoading) {
        return (
            <div className="flex min-h-full flex-1 flex-col justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-4 text-lg">Verifying your account...</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                {/* Back to Home Button */}
                <div className="absolute top-4 left-4">
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-ghost btn-sm gap-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Home
                    </button>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="Your Company"
                        src="./paw.png"
                        className="mx-auto h-16 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl font-bold tracking-tight">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    {(error || authError) && (
                        <div className="alert alert-error mb-4">
                            <span>{error || authError}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">
                                Email Address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className="input input-bordered w-full"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-semibold text-primary hover:text-primary-focus">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="input input-bordered w-full"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Not a member?{' '}
                        <Link to="/signup" className="font-semibold text-primary hover:text-primary-focus">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;
