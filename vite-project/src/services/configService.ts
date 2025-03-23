// SOLUTION NO. 1
// const getBackendURL = (fallback: string = "http://localhost:3000") => {
//   return (window as any).APP_CONFIG?.API_URL ||
//     import.meta.env.VITE_BACKEND_URL ||
//     fallback;
// };
// I don't like the "any" type assertion in the window object.

// SOLUTION NO. 2
import "../global.d";
const getBackendURL = (fallback: string = "http://localhost:3000") => {
  return window.APP_CONFIG?.API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    fallback;
};

export { getBackendURL };
