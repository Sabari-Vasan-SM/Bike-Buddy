const cors = require("cors")

const allowedOrigins = [
  "http://localhost:3000", // React default dev server
  "http://localhost:3001", // If you use this port
  "127.0.0.1:3000",
  "https://cartrabbit-nine.vercel.app", // Deployed frontend
  "https://cartrabbit-1-p9a2.onrender.com" // (optional) allow backend itself
  // add any other allowed origins here
];

module.exports = cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
})
