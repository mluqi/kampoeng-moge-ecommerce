const express = require("express");
const router = express.Router();
const {
  getProvinces,
  getCities,
  getDistricts,
  getSubdistricts,
  getZipCode,
  getLocationByZipCode,
  searchLocation,
} = require("../controllers/destinationController");

router.get("/provinces", getProvinces);
router.get("/cities", getCities);
router.get("/districts", getDistricts);
router.get("/subdistricts", getSubdistricts);
router.get("/zipcode", getZipCode);
router.get("/location", getLocationByZipCode);
router.get("/search", searchLocation);

module.exports = router;
