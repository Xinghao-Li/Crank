/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);\n// import '../styles/globals.css'\n// import type { AppProps } from 'next/app'\n// function MyApp({ Component, pageProps }: AppProps) {\n//   return <Component {...pageProps} />\n// }\n// export default MyApp\n\n\n\n\n// 不需要验证的路由列表\nconst PUBLIC_ROUTES = [\n    \"/\",\n    \"/login\",\n    \"/register\",\n    \"/reset-password\"\n];\nfunction MyApp({ Component, pageProps }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const [authorized, setAuthorized] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{\n        // 验证token的函数\n        const verifyToken = async ()=>{\n            const token = localStorage.getItem(\"token\");\n            // 如果是公开路由，允许访问\n            if (PUBLIC_ROUTES.includes(router.pathname)) {\n                setAuthorized(true);\n                setLoading(false);\n                return;\n            }\n            // 如果没有token且不是公开路由，重定向到登录页\n            if (!token) {\n                setAuthorized(false);\n                router.push(\"/login\");\n                return;\n            }\n            try {\n                const response = await fetch(\"http://localhost:5000/api/verify\", {\n                    method: \"GET\",\n                    headers: {\n                        \"Authorization\": token\n                    }\n                });\n                const data = await response.json();\n                if (data.success) {\n                    setAuthorized(true);\n                    // 如果已登录用户访问登录页，重定向到仪表板\n                    if (PUBLIC_ROUTES.includes(router.pathname)) {\n                        router.push(\"/dashboard\");\n                    }\n                } else {\n                    // token 无效，清除存储并重定向到登录页\n                    localStorage.removeItem(\"token\");\n                    localStorage.removeItem(\"userId\");\n                    setAuthorized(false);\n                    router.push(\"/login\");\n                }\n            } catch (error) {\n                console.error(\"Auth error:\", error);\n                setAuthorized(false);\n                router.push(\"/login\");\n            } finally{\n                setLoading(false);\n            }\n        };\n        // 检查认证状态\n        const checkAuth = ()=>{\n            verifyToken();\n        };\n        // 监听路由变化\n        router.events.on(\"routeChangeStart\", ()=>setLoading(true));\n        router.events.on(\"routeChangeComplete\", checkAuth);\n        router.events.on(\"routeChangeError\", ()=>setLoading(false));\n        // 初始检查\n        checkAuth();\n        // 清理\n        return ()=>{\n            router.events.off(\"routeChangeStart\", ()=>setLoading(true));\n            router.events.off(\"routeChangeComplete\", checkAuth);\n            router.events.off(\"routeChangeError\", ()=>setLoading(false));\n        };\n    }, [\n        router.pathname\n    ]);\n    // 加载状态显示\n    if (loading) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"min-h-screen bg-gray-100 flex items-center justify-center\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"text-lg font-medium text-gray-600\",\n                children: \"Loading...\"\n            }, void 0, false, {\n                fileName: \"D:\\\\9900final_version\\\\capstone-project-2024-t3-9900w11agoodluckhavefun\\\\frontend\\\\pages\\\\_app.tsx\",\n                lineNumber: 101,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"D:\\\\9900final_version\\\\capstone-project-2024-t3-9900w11agoodluckhavefun\\\\frontend\\\\pages\\\\_app.tsx\",\n            lineNumber: 100,\n            columnNumber: 7\n        }, this);\n    }\n    // 如果用户未认证且不是公开路由，不显示任何内容\n    if (!authorized && !PUBLIC_ROUTES.includes(router.pathname)) {\n        return null;\n    }\n    // 已认证或是公开路由，显示组件\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n        ...pageProps\n    }, void 0, false, {\n        fileName: \"D:\\\\9900final_version\\\\capstone-project-2024-t3-9900w11agoodluckhavefun\\\\frontend\\\\pages\\\\_app.tsx\",\n        lineNumber: 112,\n        columnNumber: 10\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUEsaUVBQWVGLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly95b3VyLXByb2plY3QtbmFtZS8uL3BhZ2VzL19hcHAudHN4PzJmYmUiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnXHJcbi8vIGltcG9ydCB0eXBlIHsgQXBwUHJvcHMgfSBmcm9tICduZXh0L2FwcCdcclxuXHJcbi8vIGZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcclxuLy8gICByZXR1cm4gPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4vLyB9XHJcblxyXG4vLyBleHBvcnQgZGVmYXVsdCBNeUFwcFxyXG5cclxuaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnO1xyXG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xyXG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L3JvdXRlcic7XHJcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XHJcblxyXG4vLyDkuI3pnIDopoHpqozor4HnmoTot6/nlLHliJfooahcclxuY29uc3QgUFVCTElDX1JPVVRFUyA9IFsnLycsICcvbG9naW4nLCAnL3JlZ2lzdGVyJywgJy9yZXNldC1wYXNzd29yZCddO1xyXG5cclxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xyXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xyXG4gIGNvbnN0IFthdXRob3JpemVkLCBzZXRBdXRob3JpemVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIC8vIOmqjOivgXRva2Vu55qE5Ye95pWwXHJcbiAgICBjb25zdCB2ZXJpZnlUb2tlbiA9IGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKTtcclxuICAgICAgXHJcbiAgICAgIC8vIOWmguaenOaYr+WFrOW8gOi3r+eUse+8jOWFgeiuuOiuv+mXrlxyXG4gICAgICBpZiAoUFVCTElDX1JPVVRFUy5pbmNsdWRlcyhyb3V0ZXIucGF0aG5hbWUpKSB7XHJcbiAgICAgICAgc2V0QXV0aG9yaXplZCh0cnVlKTtcclxuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIOWmguaenOayoeaciXRva2Vu5LiU5LiN5piv5YWs5byA6Lev55Sx77yM6YeN5a6a5ZCR5Yiw55m75b2V6aG1XHJcbiAgICAgIGlmICghdG9rZW4pIHtcclxuICAgICAgICBzZXRBdXRob3JpemVkKGZhbHNlKTtcclxuICAgICAgICByb3V0ZXIucHVzaCgnL2xvZ2luJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9hcGkvdmVyaWZ5Jywge1xyXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiB0b2tlblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICAgICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICBzZXRBdXRob3JpemVkKHRydWUpO1xyXG5cclxuICAgICAgICAgIC8vIOWmguaenOW3sueZu+W9leeUqOaIt+iuv+mXrueZu+W9lemhte+8jOmHjeWumuWQkeWIsOS7quihqOadv1xyXG4gICAgICAgICAgaWYgKFBVQkxJQ19ST1VURVMuaW5jbHVkZXMocm91dGVyLnBhdGhuYW1lKSkge1xyXG4gICAgICAgICAgICByb3V0ZXIucHVzaCgnL2Rhc2hib2FyZCcpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gdG9rZW4g5peg5pWI77yM5riF6Zmk5a2Y5YKo5bm26YeN5a6a5ZCR5Yiw55m75b2V6aG1XHJcbiAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKTtcclxuICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VySWQnKTtcclxuICAgICAgICAgIHNldEF1dGhvcml6ZWQoZmFsc2UpO1xyXG4gICAgICAgICAgcm91dGVyLnB1c2goJy9sb2dpbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRoIGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICBzZXRBdXRob3JpemVkKGZhbHNlKTtcclxuICAgICAgICByb3V0ZXIucHVzaCgnL2xvZ2luJyk7XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8g5qOA5p+l6K6k6K+B54q25oCBXHJcbiAgICBjb25zdCBjaGVja0F1dGggPSAoKSA9PiB7XHJcbiAgICAgIHZlcmlmeVRva2VuKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIOebkeWQrOi3r+eUseWPmOWMllxyXG4gICAgcm91dGVyLmV2ZW50cy5vbigncm91dGVDaGFuZ2VTdGFydCcsICgpID0+IHNldExvYWRpbmcodHJ1ZSkpO1xyXG4gICAgcm91dGVyLmV2ZW50cy5vbigncm91dGVDaGFuZ2VDb21wbGV0ZScsIGNoZWNrQXV0aCk7XHJcbiAgICByb3V0ZXIuZXZlbnRzLm9uKCdyb3V0ZUNoYW5nZUVycm9yJywgKCkgPT4gc2V0TG9hZGluZyhmYWxzZSkpO1xyXG5cclxuICAgIC8vIOWIneWni+ajgOafpVxyXG4gICAgY2hlY2tBdXRoKCk7XHJcblxyXG4gICAgLy8g5riF55CGXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICByb3V0ZXIuZXZlbnRzLm9mZigncm91dGVDaGFuZ2VTdGFydCcsICgpID0+IHNldExvYWRpbmcodHJ1ZSkpO1xyXG4gICAgICByb3V0ZXIuZXZlbnRzLm9mZigncm91dGVDaGFuZ2VDb21wbGV0ZScsIGNoZWNrQXV0aCk7XHJcbiAgICAgIHJvdXRlci5ldmVudHMub2ZmKCdyb3V0ZUNoYW5nZUVycm9yJywgKCkgPT4gc2V0TG9hZGluZyhmYWxzZSkpO1xyXG4gICAgfTtcclxuICB9LCBbcm91dGVyLnBhdGhuYW1lXSk7XHJcblxyXG4gIC8vIOWKoOi9veeKtuaAgeaYvuekulxyXG4gIGlmIChsb2FkaW5nKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1ncmF5LTEwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LW1lZGl1bSB0ZXh0LWdyYXktNjAwXCI+TG9hZGluZy4uLjwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyDlpoLmnpznlKjmiLfmnKrorqTor4HkuJTkuI3mmK/lhazlvIDot6/nlLHvvIzkuI3mmL7npLrku7vkvZXlhoXlrrlcclxuICBpZiAoIWF1dGhvcml6ZWQgJiYgIVBVQkxJQ19ST1VURVMuaW5jbHVkZXMocm91dGVyLnBhdGhuYW1lKSkge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvLyDlt7LorqTor4HmiJbmmK/lhazlvIDot6/nlLHvvIzmmL7npLrnu4Tku7ZcclxuICByZXR1cm4gPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTXlBcHA7Il0sIm5hbWVzIjpbInVzZVJvdXRlciIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiUFVCTElDX1JPVVRFUyIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwicm91dGVyIiwiYXV0aG9yaXplZCIsInNldEF1dGhvcml6ZWQiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsInZlcmlmeVRva2VuIiwidG9rZW4iLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiaW5jbHVkZXMiLCJwYXRobmFtZSIsInB1c2giLCJyZXNwb25zZSIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsImRhdGEiLCJqc29uIiwic3VjY2VzcyIsInJlbW92ZUl0ZW0iLCJlcnJvciIsImNvbnNvbGUiLCJjaGVja0F1dGgiLCJldmVudHMiLCJvbiIsIm9mZiIsImRpdiIsImNsYXNzTmFtZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();