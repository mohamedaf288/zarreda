const config = {
  apiUrl:
    process.env.NODE_ENV === "production"
      ? "/api" // En production, utilise le chemin relatif
      : "http://localhost:5000/api", // En développement, utilise l'URL locale
};

export default config;
