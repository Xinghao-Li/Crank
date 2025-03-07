// // import '../styles/globals.css'
// // import type { AppProps } from 'next/app'

// // function MyApp({ Component, pageProps }: AppProps) {
// //   return <Component {...pageProps} />
// // }

// // export default MyApp

// import '../styles/globals.css';
// import type { AppProps } from 'next/app';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';

// // route list that doens't need verification 
// const PUBLIC_ROUTES = ['/', '/login', '/register', '/reset-password'];

// function MyApp({ Component, pageProps }: AppProps) {
//   const router = useRouter();
//   const [authorized, setAuthorized] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // function to verify token 
//     const verifyToken = async () => {
//       const token = localStorage.getItem('token');
      
//       // if it is public route, allow access 
//       if (PUBLIC_ROUTES.includes(router.pathname)) {
//         setAuthorized(true);
//         setLoading(false);
//         return;
//       }

//       // if no token and not public route, redirect to login page
//       if (!token) {
//         setAuthorized(false);
//         router.push('/login');
//         return;
//       }

//       try {
//         const response = await fetch('http://localhost:5000/api/verify', {
//           method: 'GET',
//           headers: {
//             'Authorization': token
//           }
//         });

//         const data = await response.json();

//         if (data.success) {
//           setAuthorized(true);

//           // if the user has logged in, redirect to dashboard 
//           if (PUBLIC_ROUTES.includes(router.pathname)) {
//             router.push('/dashboard');
//           }

//         } else {
//           // token invalid, clear storage and redirect to log in page 
//           localStorage.removeItem('token');
//           localStorage.removeItem('userId');
//           setAuthorized(false);
//           router.push('/login');
//         }
//       } catch (error) {
//         console.error('Auth error:', error);
//         setAuthorized(false);
//         router.push('/login');
//       } finally {
//         setLoading(false);
//       }
//     };

//     //  Check authentication status
//     const checkAuth = () => {
//       verifyToken();
//     };

//     // monitor the route change 
//     router.events.on('routeChangeStart', () => setLoading(true));
//     router.events.on('routeChangeComplete', checkAuth);
//     router.events.on('routeChangeError', () => setLoading(false));

//     // checkauth - initial 
//     checkAuth();

//     // clear
//     return () => {
//       router.events.off('routeChangeStart', () => setLoading(true));
//       router.events.off('routeChangeComplete', checkAuth);
//       router.events.off('routeChangeError', () => setLoading(false));
//     };
//   }, [router.pathname]);

//   // load status  
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-lg font-medium text-gray-600">Loading...</div>
//       </div>
//     );
//   }

//   //  if user is not authenticated and not public route, don't show any info 
//   if (!authorized && !PUBLIC_ROUTES.includes(router.pathname)) {
//     return null;
//   }

//   // already authenticated or public route, show components 
//   return <Component {...pageProps} />;
// }

// export default MyApp;

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

// 不需要验证的公共路由列表
const PUBLIC_ROUTES = ['/', '/login', '/register', '/reset-password'];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // 检查是否启用了演示模式
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    setDemoMode(isDemoMode);

    // 验证令牌的函数
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      // 如果是公共路由，允许访问
      if (PUBLIC_ROUTES.includes(router.pathname)) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // 如果开启了演示模式，允许访问所有路由
      if (isDemoMode) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // 如果没有令牌且不是公共路由，重定向到登录页面
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

          // 如果用户已登录，重定向到仪表板
          if (PUBLIC_ROUTES.includes(router.pathname)) {
            router.push('/dashboard');
          }
        } else {
          // 令牌无效，清除存储并重定向到登录页面
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

    // 检查认证状态
    const checkAuth = () => {
      verifyToken();
    };

    // 监控路由变化
    router.events.on('routeChangeStart', () => setLoading(true));
    router.events.on('routeChangeComplete', checkAuth);
    router.events.on('routeChangeError', () => setLoading(false));

    // 初始检查认证
    checkAuth();

    // 清理
    return () => {
      router.events.off('routeChangeStart', () => setLoading(true));
      router.events.off('routeChangeComplete', checkAuth);
      router.events.on('routeChangeError', () => setLoading(false));
    };
  }, [router.pathname]);

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  // 如果用户未经认证且不是公共路由，不显示任何信息
  if (!authorized && !PUBLIC_ROUTES.includes(router.pathname)) {
    return null;
  }

  // 渲染组件并添加演示模式提示条（如果处于演示模式）
  return (
    <>
      {demoMode && (
        <div className="bg-yellow-100 p-2 text-center text-sm fixed top-0 left-0 right-0 z-50">
          当前处于演示模式，部分功能可能无法使用。这仅是项目展示。
        </div>
      )}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;