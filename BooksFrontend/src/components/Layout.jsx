import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import Header from "./Header";
import PageSkeleton from "./PageSkeleton";

const LOADING_PATHS = new Set(["/", "/catalogue", "/leaderboard"]);

function Layout() {
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(
    LOADING_PATHS.has(location.pathname)
  );

  useEffect(() => {
    if (!LOADING_PATHS.has(location.pathname)) {
      setIsPageLoading(false);
      return;
    }

    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 450);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Header />
      {isPageLoading ? (
        <PageSkeleton />
      ) : (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: -22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <Breadcrumbs />
          <Outlet />
        </motion.div>
      )}
    </div>
  );
}

export default Layout;
