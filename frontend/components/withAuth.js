import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// List of routes that do not need to be authenticated
const publicRoutes = ['/login', '/register'];

export function withAuth(WrappedComponent) {
  return function AuthComponent(props) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        // If the current path is a public route, it is displayed directly
        if (publicRoutes.includes(router.pathname)) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        
        if (!token) {
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
            setIsAuthenticated(true);
          } else {
            // If verification fails, clear local storage and redirect to the login page
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            router.push('/login');
          }
        } catch (error) {
          console.error('Error verifying authentication:', error);
          router.push('/login');
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, [router.pathname]);

    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>;
    }

    // If the route is public or authenticated, the component is displayed
    if (publicRoutes.includes(router.pathname) || isAuthenticated) {
      return <WrappedComponent {...props} />;
    }

    // Displays nothing when unauthenticated and not a public route (redirects to the login page)
    return null;
  };
}