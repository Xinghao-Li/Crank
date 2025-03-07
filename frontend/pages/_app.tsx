// import '../styles/globals.css'
// import type { AppProps } from 'next/app'

// function MyApp({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />
// }

// export default MyApp

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// route list that doens't need verification 
const PUBLIC_ROUTES = ['/', '/login', '/register', '/reset-password'];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // function to verify token 
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      // if it is public route, allow access 
      if (PUBLIC_ROUTES.includes(router.pathname)) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // if no token and not public route, redirect to login page
      if (!token) {
        setAuthorized(false);
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/verify', {
          method: 'GET',
          headers: {
            'Authorization': token
          }
        });

        const data = await response.json();

        if (data.success) {
          setAuthorized(true);

          // if the user has logged in, redirect to dashboard 
          if (PUBLIC_ROUTES.includes(router.pathname)) {
            router.push('/dashboard');
          }

        } else {
          // token invalid, clear storage and redirect to log in page 
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setAuthorized(false);
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setAuthorized(false);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    //  Check authentication status
    const checkAuth = () => {
      verifyToken();
    };

    // monitor the route change 
    router.events.on('routeChangeStart', () => setLoading(true));
    router.events.on('routeChangeComplete', checkAuth);
    router.events.on('routeChangeError', () => setLoading(false));

    // checkauth - initial 
    checkAuth();

    // clear
    return () => {
      router.events.off('routeChangeStart', () => setLoading(true));
      router.events.off('routeChangeComplete', checkAuth);
      router.events.off('routeChangeError', () => setLoading(false));
    };
  }, [router.pathname]);

  // load status  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  //  if user is not authenticated and not public route, don't show any info 
  if (!authorized && !PUBLIC_ROUTES.includes(router.pathname)) {
    return null;
  }

  // already authenticated or public route, show components 
  return <Component {...pageProps} />;
}

export default MyApp;