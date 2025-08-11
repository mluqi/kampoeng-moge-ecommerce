"use client";

import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import api from "@/service/api";
import { useRouter } from "next/navigation";

const AddAddress = () => {
  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    state: "",
    city: "",
    district: "",
    subdistrict: "",
    pincode: "",
    area: "",
    country: "Indonesia",
    label: "",
    isDefault: false,
  });

  // State untuk menyimpan pilihan dropdown
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);

  // State untuk loading dropdown
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);
  const [loadingZipCode, setLoadingZipCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // State untuk pencarian kode pos
  const [zipCodeSearch, setZipCodeSearch] = useState("");
  const [zipCodeError, setZipCodeError] = useState("");
  const [loadingZipCodeSearch, setLoadingZipCodeSearch] = useState(false);
  const [addressLocked, setAddressLocked] = useState(false);

  const handleResetAddress = () => {
    setAddress((prev) => ({
      ...prev,
      state: "",
      city: "",
      district: "",
      subdistrict: "",
      pincode: "",
      area: "",
    }));
    setCities([]);
    setDistricts([]);
    setSubdistricts([]);
    setAddressLocked(false);
    setZipCodeSearch("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        pincode: address.pincode,
        area: `${address.area}, Kel. ${address.subdistrict}, Kec. ${address.district}`,
        city: address.city,
        state: address.state,
        country: address.country,
        label: address.label,
        isDefault: address.isDefault,
      };

      const res = await api.post("/auth/address", payload);
      setSuccess("Alamat berhasil ditambahkan!");
      setTimeout(() => {
        router.push("/profile?tab=address");
      }, 1000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Gagal menambahkan alamat. Silakan coba lagi."
      );
    }
    setLoading(false);
  };

  const handleZipCodeSearch = async () => {
    if (!zipCodeSearch.trim()) {
      setZipCodeError("Silakan masukkan kode pos.");
      return;
    }
    setLoadingZipCodeSearch(true);
    setZipCodeError("");
    try {
      const res = await api.get(
        `/destinations/location?zipCode=${zipCodeSearch}`
      );
      const { province, city, district, subdistrict, zipCode, country } =
        res.data;

      // Populate dropdowns so the values are displayed correctly
      setCities([city]);
      setDistricts([district]);
      setSubdistricts([subdistrict]);

      setAddress((prev) => ({
        ...prev,
        state: province,
        city: city,
        district: district,
        subdistrict: subdistrict,
        pincode: zipCode,
        country: country || prev.country,
      }));
      setAddressLocked(true);
    } catch (err) {
      setZipCodeError(
        err?.response?.data?.message || "Kode pos tidak ditemukan."
      );
    } finally {
      setLoadingZipCodeSearch(false);
    }
  };

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await api.get("/destinations/provinces");
        setProvinces(res.data);
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
      }
      setLoadingProvinces(false);
    };
    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (address.state && !addressLocked) {
      const fetchCities = async () => {
        setLoadingCities(true);
        setCities([]);
        setDistricts([]);
        setSubdistricts([]);
        setAddress((prev) => ({
          ...prev,
          city: "",
          district: "",
          subdistrict: "",
          pincode: "",
        }));
        try {
          const res = await api.get(
            `/destinations/cities?province=${encodeURIComponent(address.state)}`
          );
          setCities(res.data);
        } catch (err) {
          console.error("Failed to fetch cities:", err);
        }
        setLoadingCities(false);
      };
      fetchCities();
    }
  }, [address.state, addressLocked]); // Dependency sudah benar

  // Fetch districts when city changes
  useEffect(() => {
    if (address.city && !addressLocked) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        setDistricts([]);
        setSubdistricts([]);
        setAddress((prev) => ({
          ...prev,
          district: "",
          subdistrict: "",
          pincode: "",
        }));
        try {
          const res = await api.get(
            `/destinations/districts?city=${encodeURIComponent(
              address.city
            )}&province=${encodeURIComponent(address.state)}`
          );
          setDistricts(res.data);
        } catch (err) {
          console.error("Failed to fetch districts:", err);
        }
        setLoadingDistricts(false);
      };
      fetchDistricts();
    }
  }, [address.city, address.state, addressLocked]); // Dependency sudah benar

  // Fetch subdistricts when district changes
  useEffect(() => {
    if (address.district && !addressLocked) {
      const fetchSubdistricts = async () => {
        setLoadingSubdistricts(true);
        setSubdistricts([]);
        setAddress((prev) => ({ ...prev, subdistrict: "", pincode: "" }));
        try {
          const res = await api.get(
            `/destinations/subdistricts?district=${encodeURIComponent(
              address.district
            )}&city=${encodeURIComponent(
              address.city
            )}&province=${encodeURIComponent(address.state)}`
          );
          setSubdistricts(res.data);
        } catch (err) {
          console.error("Failed to fetch subdistricts:", err);
        }
        setLoadingSubdistricts(false);
      };
      fetchSubdistricts();
    }
  }, [address.district, address.city, address.state, addressLocked]); // Dependency sudah benar

  // Fetch zip code when subdistrict changes
  useEffect(() => {
    if (address.subdistrict && !addressLocked) {
      const fetchZipCode = async () => {
        // setLoadingZipCode(true);
        try {
          // Kirim semua parameter hierarki untuk akurasi yang lebih baik
          const params = new URLSearchParams({
            subdistrict: address.subdistrict,
            district: address.district,
            city: address.city,
            province: address.state,
          });

          const res = await api.get(
            `/destinations/zipcode?${params.toString()}`
          );
          setAddress((prev) => ({ ...prev, pincode: res.data.zipCode || "" }));
        } catch (err) {
          console.error("Failed to fetch zip code:", err);
          setAddress((prev) => ({ ...prev, pincode: "" }));
        }
        setLoadingZipCode(false);
      };
      fetchZipCode();
    }
  }, [
    // Dependency sudah benar
    address.subdistrict,
    address.district,
    address.city,
    address.state,
    addressLocked,
  ]);

  return (
    <>
      <Navbar />
      <div className="bg-white text-gray-700 px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-800">
            Tambah Alamat{" "}
            <span className="font-semibold text-accent">Pengiriman</span>
          </p>
          <div className="space-y-4 max-w-sm mt-10">
            {/* Full Name & Phone Number */}
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              name="fullName"
              placeholder="Full name"
              onChange={handleInputChange}
              value={address.fullName}
              required
            />
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              name="phoneNumber"
              placeholder="Phone number"
              onChange={handleInputChange}
              value={address.phoneNumber}
              required
            />

            {/* Search by Postal Code */}
            <div className="space-y-2 pt-4">
              <p className="font-medium text-gray-700">
                Cari Alamat dengan Kode Pos
              </p>
              <div className="flex space-x-2">
                <input
                  className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
                  type="text"
                  placeholder="Masukkan Kode Pos"
                  value={zipCodeSearch}
                  onChange={(e) => setZipCodeSearch(e.target.value)}
                  disabled={addressLocked}
                />
                <button
                  type="button"
                  onClick={handleZipCodeSearch}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition disabled:bg-gray-400 whitespace-nowrap"
                  disabled={loadingZipCodeSearch || addressLocked}
                >
                  {loadingZipCodeSearch ? "Mencari..." : "Cari"}
                </button>
              </div>
              {zipCodeError && (
                <p className="text-red-500 text-sm mt-1">{zipCodeError}</p>
              )}
              {addressLocked && (
                <button
                  type="button"
                  onClick={handleResetAddress}
                  className="text-sm text-accent hover:underline mt-1"
                >
                  Isi manual atau cari ulang
                </button>
              )}
            </div>
            <hr className="my-4" />

            {/* Provinsi */}
            <select
              name="state"
              value={address.state}
              onChange={handleInputChange}
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-white"
              required
              disabled={loadingProvinces || addressLocked}
            >
              <option value="">
                {loadingProvinces ? "Memuat..." : "Pilih Provinsi"}
              </option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>

            {/* Kota/Kabupaten */}
            <select
              name="city"
              value={address.city}
              onChange={handleInputChange}
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-white"
              required
              disabled={!address.state || loadingCities || addressLocked}
            >
              <option value="">
                {loadingCities ? "Memuat..." : "Pilih Kota/Kabupaten"}
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Kecamatan */}
            <select
              name="district"
              value={address.district}
              onChange={handleInputChange}
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-white"
              required
              disabled={!address.city || loadingDistricts || addressLocked}
            >
              <option value="">
                {loadingDistricts ? "Memuat..." : "Pilih Kecamatan"}
              </option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>

            {/* Kelurahan/Desa */}
            <select
              name="subdistrict"
              value={address.subdistrict}
              onChange={handleInputChange}
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-white"
              required
              disabled={
                !address.district || loadingSubdistricts || addressLocked
              }
            >
              <option value="">
                {loadingSubdistricts ? "Memuat..." : "Pilih Kelurahan/Desa"}
              </option>
              {subdistricts.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Kode Pos dan Negara */}
            <div className="flex space-x-4">
              <div className="relative w-full">
                <input
                  className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-gray-100"
                  type="text"
                  name="pincode"
                  placeholder="Kode Pos"
                  value={address.pincode}
                  required
                  readOnly
                />
                {loadingZipCode && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                  </div>
                )}
              </div>
              <input
                className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-gray-100"
                type="text"
                name="country"
                placeholder="Negara"
                value={address.country}
                readOnly
              />
            </div>

            {/* Detail Alamat */}
            <textarea
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full resize-none"
              rows={3}
              name="area"
              placeholder="Detail Alamat (Nama Jalan, No. Rumah, RT/RW)"
              onChange={handleInputChange}
              value={address.area}
              required
            ></textarea>

            {/* Label */}
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              name="label"
              placeholder="Label (ex: Rumah, Kantor, dll)"
              onChange={handleInputChange}
              value={address.label}
            />

            {/* Checkbox Alamat Utama */}
            <div className="flex items-center space-x-2">
              <input
                id="isDefault"
                type="checkbox"
                name="isDefault"
                checked={address.isDefault}
                onChange={(e) =>
                  setAddress({ ...address, isDefault: e.target.checked })
                }
                className="h-4 w-4 text-accent border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Jadikan alamat utama
              </label>
            </div>

            {/* Debug Info (hapus di production) */}
            {/* {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                <p>
                  Debug: {address.state} → {address.city} → {address.district} →{" "}
                  {address.subdistrict}
                </p>
              </div>
            )} */}

            {/* Error dan Success Messages */}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </div>

          <button
            type="submit"
            className="max-w-sm w-full mt-6 bg-accent text-white py-3 rounded-md hover:bg-accent/90 transition uppercase"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save address"}
          </button>
        </form>

        <Image
          className="md:ml-16 mt-16 md:mt-0"
          src={assets.my_location_image}
          alt="my_location_image"
          width={700}
          height={700}
        />
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;
