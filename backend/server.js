require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

// Initialize database connection before listening for traffic
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started successfully on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed. Exiting process...", err);
    process.exit(1);
});
