const authenticateToken = (req, res, next) => {
  // Get the access token from the request headers or cookies
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Access token not provided" });
  }

  try {
    // Verify the access token
    const decoded = jwt.verify(token, process.env.accessToken);
    req.user = decoded; // Store decoded user information in request object
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Refresh Token middleware
const refreshAccessToken = (req, res, next) => {
  // Check if the access token has expired
  const token = req.cookies.accessToken;
  if (!token) {
    return next(); // No access token found, proceed to the next middleware
  }

  try {
    jwt.verify(token, process.env.accessToken); // Verify the access token
    next(); // Access token is still valid, proceed to the next middleware
  } catch (error) {
    // Access token has expired, try to refresh it using the refresh token
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token not provided" });
    }

    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKENS);
      // If refresh token is valid, generate a new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.accessToken,
        { expiresIn: "1h" }
      );
      // Set the new access token in the response headers or cookies
      res.cookie(process.env.accessToken, newAccessToken, { httpOnly: true });
      next(); // Proceed to the next middleware
    } catch (error) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  }
};

export { refreshAccessToken, authenticateToken };
