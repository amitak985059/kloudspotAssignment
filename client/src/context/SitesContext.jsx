import { createContext, useContext, useEffect, useRef, useState } from "react";
import { allSitesAPI } from "../services/api";
import { useAuth } from "./AuthContext";


const SitesContext = createContext(null);

export const SitesProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchedRef = useRef(false);

  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await allSitesAPI.getAllSites();
      const sitesData = res.data || [];
      console.log("✅ Sites fetched:", sitesData);
      setSites(sitesData);
      
      setSelectedSite(sitesData[0] || null);
    } catch (err) {
      console.error("❌ Failed to fetch sites:", err);
      setError("Failed to load sites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
        if (authLoading) return;               
    if (!isAuthenticated) return;            
    if (fetchedRef.current) return; 
    fetchedRef.current = true;

    fetchSites();
  }, [authLoading, isAuthenticated]);

  const value = {
    sites,
    selectedSite,
    setSelectedSite,
    loading,
    error,
    refetchSites: fetchSites,
  };

  return (
    <SitesContext.Provider value={value}>
      {children}
    </SitesContext.Provider>
  );
};

export const useSites = () => {
  const context = useContext(SitesContext);
  if (!context) {
    throw new Error("useSites must be used within SitesProvider");
  }
  return context;
};
