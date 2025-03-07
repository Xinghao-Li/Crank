import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { withAuth } from '@/components/withAuth';

// Error prompt component
function ErrorAlert({ message }) {
  return (
    <Alert className="mt-2">
      <AlertDescription className="text-red-600 text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );
}

function LoginPage() {
  // status management 
  const [isRegister, setIsRegister] = useState(false); // show log in page by default 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState(''); // add verficiation code status 
  const [countdown, setCountdown] = useState(0); // Add countdown state

  const router = useRouter();

  //  check log in status of user 
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/verify', {
            method: 'GET',
            headers: { 'Authorization': token },
          });
          const data = await response.json();
          if (data.success) {
            router.push('/dashboard');
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
        }
      }
    };
    checkToken();
  }, []);

  // email format verification 
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // deal with and send out verification code 
  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterStep(2);
        setCountdown(180);
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

  // deal with registration upload
  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          email,
          verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user_id);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Error: Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // deal with log in 
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user_id);
        router.push('/dashboard');
      } else {
        setError(
          response.status === 401
            ? 'Unauthorized: Invalid username or password.'
            : response.status === 404
              ? 'Server error: The endpoint is not found.'
              : `Error: ${data.message || 'Unknown error'}`
        );
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
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            {isRegister ? 'Register' : 'Login'}
          </h2>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister ? (
              <>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  required
                  autoComplete="username"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="Please enter a valid email address"
                  autoComplete="email"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                  autoComplete="new-password"
                />

                {registerStep === 2 && (
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                )}

                {error && <ErrorAlert message={error} />}

                // 在你的登录组件中添加
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      // 存储一个演示模式标志
                      localStorage.setItem('demoMode', 'true');
                      // 重定向到主界面
                      router.push('/dashboard'); // 或者其他你的主界面路径
                    }}
                    variant="outline"
                  >
                    演示模式（跳过登录）
                  </Button>
                </div>

                <div className="flex gap-4">
                  {registerStep === 1 ? (
                    <Button
                      type="button"
                      onClick={handleSendCode}
                      className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <span className="mr-2">Sending Code</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        </div>
                      ) : (
                        'Get Verification Code'
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <span className="mr-2">Registering</span>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          </div>
                        ) : (
                          'Complete Registration'
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
                    </>
                  )}
                </div>
              </>
            ) : (
              // log in table 
              <>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  required
                  autoComplete="username"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                  autoComplete="current-password"
                />
                {error && <ErrorAlert message={error} />}
                <div className="flex justify-between items-center text-sm">
                  <Link
                    href="/reset-password"
                    className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">Processing</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    </div>
                  ) : 'Login'}
                </Button>
              </>
            )}
          </form>

          <Button
            type="button"
            variant="link"
            onClick={() => {
              setIsRegister(!isRegister);
              setRegisterStep(1);
              setError('');
              setUsername('');
              setPassword('');
              setEmail('');
              setVerificationCode('');
            }}
            className="w-full mt-4 text-gray-600 hover:text-gray-900"
          >
            {isRegister
              ? 'Already have an account? Login'
              : "Don't have an account? Register"
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
export default withAuth(LoginPage);
