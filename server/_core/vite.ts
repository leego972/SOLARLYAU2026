export function serveStatic(app: Express) {
  // IMPORTANT: use process.cwd() so prod runtime resolves to /app/dist/public (not /dist/public)
  const distPath = path.resolve(projectRoot, "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
