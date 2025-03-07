import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';
import { useRouter } from 'next/router';

function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Error alert component
  const ErrorAlert = ({ message }) => (
    <Alert className="mt-2">
      <AlertDescription className="text-red-600 text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );

  // Email format validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle sending verification code
  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Send a request to send a verification code
      const response = await fetch('http://localhost:5000/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setCountdown(180); // 3 mins count down 
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Error: Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // firstly verify verification code 
      const verifyResponse = await fetch('http://localhost:5000/api/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          
          code: verificationCode
        }),
      });

      if (!verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        setError(verifyData.error || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      // If the verification code is correct, reset the password
      const resetResponse = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          password: newPassword
        }),
      });

      const resetData = await resetResponse.json();

      if (resetResponse.ok) {
        setStep(3); // reset succeed 
      } else {
        setError(resetData.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Error: Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-6">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h2 className="text-3xl font-bold ml-4 text-gray-800">
              Reset Password
            </h2>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
              {error && <ErrorAlert message={error} />}
              <Button
                onClick={handleSendCode}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">Sending Code</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="text"
                placeholder="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full"
                required
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
                required
              />
              {error && <ErrorAlert message={error} />}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">Resetting</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isLoading}
                  className="whitespace-nowrap"
                >
                  {countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-green-600 font-medium">
                Password reset successful!
              </div>
              <Link href="/login">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;