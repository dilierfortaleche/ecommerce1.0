const express = require("express");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, checkRole(["proveedor", "admin"]), (req, res) => {
  res.json({ message: "Producto agregado exitosamente" });
});

router.delete("/:id", verifyToken, checkRole(["admin"]), (req, res) => {
  res.json({ message: "Producto eliminado exitosamente" });
});

module.exports = router;

