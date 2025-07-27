const { list_dest, list_origin, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.getProvinces = async (req, res) => {
  try {
    const provinces = await list_dest.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("PROVINCE_NAME")), "name"],
      ],
      where: {
        PROVINCE_NAME: {
          [Op.ne]: null,
          [Op.ne]: "",
        },
      },
      order: [["PROVINCE_NAME", "ASC"]],
      raw: true,
    });

    res.status(200).json(provinces.map((p) => p.name));
  } catch (error) {
    console.error("Error getting provinces:", error);
    res.status(500).json({ message: "Gagal mengambil data provinsi." });
  }
};

exports.getCities = async (req, res) => {
  const { province } = req.query;

  if (!province) {
    return res.status(400).json({ message: "Nama provinsi diperlukan." });
  }

  try {
    const cities = await list_dest.findAll({
      where: {
        PROVINCE_NAME: province,
        CITY_NAME: {
          [Op.ne]: null,
          [Op.ne]: "",
        },
      },
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("CITY_NAME")), "name"],
      ],
      order: [["CITY_NAME", "ASC"]],
      raw: true,
    });

    res.status(200).json(cities.map((c) => c.name));
  } catch (error) {
    console.error("Error getting cities:", error);
    res.status(500).json({ message: "Gagal mengambil data kota." });
  }
};

exports.getDistricts = async (req, res) => {
  const { city, province } = req.query;

  if (!city) {
    return res.status(400).json({ message: "Nama kota diperlukan." });
  }

  try {
    const whereClause = {
      CITY_NAME: city,
      DISTRICT_NAME: {
        [Op.ne]: null,
        [Op.ne]: "",
      },
    };

    if (province) {
      whereClause.PROVINCE_NAME = province;
    }

    const districts = await list_dest.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("DISTRICT_NAME")), "name"],
      ],
      order: [["DISTRICT_NAME", "ASC"]],
      raw: true,
    });

    res.status(200).json(districts.map((d) => d.name));
  } catch (error) {
    console.error("Error getting districts:", error);
    res.status(500).json({ message: "Gagal mengambil data kecamatan." });
  }
};

exports.getSubdistricts = async (req, res) => {
  const { district, city, province } = req.query;

  if (!district) {
    return res.status(400).json({ message: "Nama kecamatan diperlukan." });
  }

  try {
    const whereClause = {
      DISTRICT_NAME: district,
      SUBDISTRICT_NAME: {
        [Op.ne]: null,
        [Op.ne]: "",
      },
    };

    if (city) {
      whereClause.CITY_NAME = city;
    }
    if (province) {
      whereClause.PROVINCE_NAME = province;
    }

    const subdistricts = await list_dest.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("SUBDISTRICT_NAME")), "name"],
      ],
      order: [["SUBDISTRICT_NAME", "ASC"]],
      raw: true,
    });

    res.status(200).json(subdistricts.map((s) => s.name));
  } catch (error) {
    console.error("Error getting subdistricts:", error);
    res.status(500).json({ message: "Gagal mengambil data kelurahan." });
  }
};

exports.getZipCode = async (req, res) => {
  const { subdistrict, district, city, province } = req.query;

  if (!subdistrict) {
    return res.status(400).json({ message: "Nama kelurahan diperlukan." });
  }

  try {
    const searchStrategies = [
      ...(province && city && district
        ? [
            {
              PROVINCE_NAME: province,
              CITY_NAME: city,
              DISTRICT_NAME: district,
              SUBDISTRICT_NAME: subdistrict,
            },
          ]
        : []),

      ...(city && district
        ? [
            {
              CITY_NAME: city,
              DISTRICT_NAME: district,
              SUBDISTRICT_NAME: subdistrict,
            },
          ]
        : []),

      ...(district
        ? [
            {
              DISTRICT_NAME: district,
              SUBDISTRICT_NAME: subdistrict,
            },
          ]
        : []),

      ...(province && city && district
        ? [
            {
              PROVINCE_NAME: { [Op.iLike]: `%${province.trim()}%` },
              CITY_NAME: { [Op.iLike]: `%${city.trim()}%` },
              DISTRICT_NAME: { [Op.iLike]: `%${district.trim()}%` },
              SUBDISTRICT_NAME: { [Op.iLike]: `%${subdistrict.trim()}%` },
            },
          ]
        : []),

      {
        SUBDISTRICT_NAME: { [Op.iLike]: `%${subdistrict.trim()}%` },
      },
    ];

    console.log(
      "Search strategies:",
      JSON.stringify(searchStrategies, null, 2)
    );

    let result = null;
    let usedStrategy = -1;

    for (let i = 0; i < searchStrategies.length; i++) {
      const whereClause = searchStrategies[i];

      console.log(
        `Trying strategy ${i + 1}:`,
        JSON.stringify(whereClause, null, 2)
      );

      result = await list_dest.findOne({
        where: whereClause,
        attributes: [
          "ZIP_CODE",
          "TARIFF_CODE",
          "PROVINCE_NAME",
          "CITY_NAME",
          "DISTRICT_NAME",
          "SUBDISTRICT_NAME",
        ],
        order: [["ZIP_CODE", "ASC"]],
        raw: true,
      });

      if (result && result.ZIP_CODE && result.ZIP_CODE.trim() !== "") {
        usedStrategy = i;
        console.log(`Found result with strategy ${i + 1}:`, result);
        break;
      }
    }

    if (!result || !result.ZIP_CODE || result.ZIP_CODE.trim() === "") {
      console.log("No zip code found with any strategy");
      return res.status(404).json({ message: "Kode pos tidak ditemukan." });
    }

    res.status(200).json({
      zipCode: result.ZIP_CODE,
      tariffCode: result.TARIFF_CODE,
      location: {
        province: result.PROVINCE_NAME,
        city: result.CITY_NAME,
        district: result.DISTRICT_NAME,
        subdistrict: result.SUBDISTRICT_NAME,
      },
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          usedStrategy: usedStrategy + 1,
          requestParams: { subdistrict, district, city, province },
        },
      }),
    });
  } catch (error) {
    console.error("Error getting zip code:", error);
    res.status(500).json({ message: "Gagal mengambil kode pos." });
  }
};

exports.getLocationByZipCode = async (req, res) => {
  const { zipCode } = req.query;

  if (!zipCode) {
    return res.status(400).json({ message: "Kode pos diperlukan." });
  }

  try {
    const location = await list_dest.findOne({
      where: { ZIP_CODE: zipCode },
      attributes: [
        "COUNTRY_NAME",
        "PROVINCE_NAME",
        "CITY_NAME",
        "DISTRICT_NAME",
        "SUBDISTRICT_NAME",
        "ZIP_CODE",
        "TARIFF_CODE",
      ],
      raw: true,
    });

    if (!location) {
      return res.status(404).json({ message: "Lokasi tidak ditemukan." });
    }

    res.status(200).json({
      country: location.COUNTRY_NAME,
      province: location.PROVINCE_NAME,
      city: location.CITY_NAME,
      district: location.DISTRICT_NAME,
      subdistrict: location.SUBDISTRICT_NAME,
      zipCode: location.ZIP_CODE,
      tariffCode: location.TARIFF_CODE,
    });
  } catch (error) {
    console.error("Error getting location by zip code:", error);
    res.status(500).json({ message: "Gagal mengambil data lokasi." });
  }
};

exports.searchLocation = async (req, res) => {
  const { keyword, type } = req.query;

  if (!keyword) {
    return res.status(400).json({ message: "Keyword pencarian diperlukan." });
  }

  try {
    let whereClause = {};
    let attributes = [];

    switch (type) {
      case "province":
        whereClause = {
          PROVINCE_NAME: {
            [Op.iLike]: `%${keyword}%`,
          },
        };
        attributes = [
          [sequelize.fn("DISTINCT", sequelize.col("PROVINCE_NAME")), "name"],
        ];
        break;
      case "city":
        whereClause = {
          CITY_NAME: {
            [Op.iLike]: `%${keyword}%`,
          },
        };
        attributes = [
          [sequelize.fn("DISTINCT", sequelize.col("CITY_NAME")), "name"],
          "PROVINCE_NAME",
        ];
        break;
      case "district":
        whereClause = {
          DISTRICT_NAME: {
            [Op.iLike]: `%${keyword}%`,
          },
        };
        attributes = [
          [sequelize.fn("DISTINCT", sequelize.col("DISTRICT_NAME")), "name"],
          "CITY_NAME",
          "PROVINCE_NAME",
        ];
        break;
      case "subdistrict":
        whereClause = {
          SUBDISTRICT_NAME: {
            [Op.iLike]: `%${keyword}%`,
          },
        };
        attributes = [
          "SUBDISTRICT_NAME",
          "DISTRICT_NAME",
          "CITY_NAME",
          "PROVINCE_NAME",
          "ZIP_CODE",
        ];
        break;
      default:
        whereClause = {
          [Op.or]: [
            { PROVINCE_NAME: { [Op.iLike]: `%${keyword}%` } },
            { CITY_NAME: { [Op.iLike]: `%${keyword}%` } },
            { DISTRICT_NAME: { [Op.iLike]: `%${keyword}%` } },
            { SUBDISTRICT_NAME: { [Op.iLike]: `%${keyword}%` } },
          ],
        };
        attributes = [
          "PROVINCE_NAME",
          "CITY_NAME",
          "DISTRICT_NAME",
          "SUBDISTRICT_NAME",
          "ZIP_CODE",
        ];
    }

    const results = await list_dest.findAll({
      where: whereClause,
      attributes,
      limit: 50, 
      order: [
        ["PROVINCE_NAME", "ASC"],
        ["CITY_NAME", "ASC"],
      ],
      raw: true,
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error searching location:", error);
    res.status(500).json({ message: "Gagal melakukan pencarian." });
  }
};
