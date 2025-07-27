"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserAuth } from "@/contexts/UserAuthContext";
import api from "@/service/api";
import { toast } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";

const EditAddressContent = () => {
  const router = useRouter();
  const { id: addressId } = useParams();
  const { profile, userProfile, loading: userLoading } = useUserAuth();
  const [loading, setLoading] = useState(true);

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

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);

  const [zipCodeSearch, setZipCodeSearch] = useState("");
  const [zipCodeError, setZipCodeError] = useState("");
  const [loadingZipCodeSearch, setLoadingZipCodeSearch] = useState(false);
  const [addressLocked, setAddressLocked] = useState(false);

  useEffect(() => {
    if (profile?.addresses) {
      const addressToEdit = profile.addresses.find(
        (addr) => addr.address_id.toString() === addressId
      );

      if (addressToEdit) {
        // Parsing area untuk memisahkan detail, kelurahan, dan kecamatan
        const areaParts =
          addressToEdit.address_area.match(/(.*?), Kel\. (.*?), Kec\. (.*)/) ||
          [];
        const detailArea = areaParts[1] || addressToEdit.address_area;
        const subdistrict = areaParts[2] || "";
        const district = areaParts[3] || "";

        setAddress({
          fullName: addressToEdit.address_full_name,
          phoneNumber: addressToEdit.address_phone,
          pincode: addressToEdit.address_pincode,
          city: addressToEdit.address_city,
          state: addressToEdit.address_state,
          country: addressToEdit.address_country,
          label: addressToEdit.address_label,
          isDefault: addressToEdit.address_is_default,
          area: detailArea,
          subdistrict: subdistrict,
          district: district,
        });
      } else {
        toast.error("Alamat tidak ditemukan.");
        router.replace("/profile?tab=address");
      }
      setLoading(false);
    }
  }, [profile, addressId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetAddress = () => {
    setAddress((prev) => ({
      ...prev,
      state: "",
      city: "",
      district: "",
      subdistrict: "",
      pincode: "",
    }));
    setAddressLocked(false);
    setZipCodeSearch("");
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
      const { province, city, district, subdistrict, zipCode } = res.data;

      setAddress((prev) => ({
        ...prev,
        state: province,
        city: city,
        district: district,
        subdistrict: subdistrict,
        pincode: zipCode,
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

  useEffect(() => {
    if (address.state) {
      const fetchCities = async () => {
        if (!addressLocked) {
          setAddress((prev) => ({
            ...prev,
            city: "",
            district: "",
            subdistrict: "",
            pincode: "",
          }));
        }
        setLoadingCities(true);
        setCities([]);
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
  }, [address.state, addressLocked]);

  useEffect(() => {
    if (address.city) {
      const fetchDistricts = async () => {
        if (!addressLocked) {
          setAddress((prev) => ({
            ...prev,
            district: "",
            subdistrict: "",
            pincode: "",
          }));
        }
        setLoadingDistricts(true);
        setDistricts([]);
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
  }, [address.city, address.state, addressLocked]);

  useEffect(() => {
    if (address.district) {
      const fetchSubdistricts = async () => {
        if (!addressLocked) {
          setAddress((prev) => ({
            ...prev,
            subdistrict: "",
            pincode: "",
          }));
        }
        setLoadingSubdistricts(true);
        setSubdistricts([]);
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
  }, [address.district, address.city, address.state, addressLocked]);

  useEffect(() => {
    if (address.subdistrict && !addressLocked) {
      const fetchZipCode = async () => {
        // Tidak perlu reset di sini karena ini adalah field terakhir
        try {
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
      };
      fetchZipCode();
    }
  }, [
    address.subdistrict,
    address.district,
    address.city,
    address.state,
    addressLocked,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...address,
      area: `${address.area}, Kel. ${address.subdistrict}, Kec. ${address.district}`,
    };
    delete payload.district;
    delete payload.subdistrict;

    const promise = api.put(`/auth/address/${addressId}`, payload);

    toast.promise(promise, {
      loading: "Menyimpan perubahan...",
      success: (res) => {
        userProfile(); // Re-fetch profile to get updated addresses
        router.push("/profile?tab=address");
        return res.data.message || "Alamat berhasil diperbarui!";
      },
      error: (err) => {
        setLoading(false);
        return err.response?.data?.message || "Gagal memperbarui alamat.";
      },
    });
  };

  if (userLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Alamat</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
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

        <select
          name="subdistrict"
          value={address.subdistrict}
          onChange={handleInputChange}
          className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-white"
          required
          disabled={!address.district || loadingSubdistricts || addressLocked}
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

        <div className="flex space-x-4">
          <input
            className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-gray-100"
            type="text"
            name="pincode"
            placeholder="Kode Pos"
            value={address.pincode}
            required
            readOnly
          />
          <input
            className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full bg-gray-100"
            type="text"
            name="country"
            placeholder="Negara"
            value={address.country}
            readOnly
          />
        </div>

        <textarea
          className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full resize-none"
          rows={3}
          name="area"
          placeholder="Detail Alamat (Nama Jalan, No. Rumah, RT/RW)"
          onChange={handleInputChange}
          value={address.area}
          required
        ></textarea>

        <input
          className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
          type="text"
          name="label"
          placeholder="Label (ex: Rumah, Kantor, dll)"
          onChange={handleInputChange}
          value={address.label}
        />

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

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/profile?tab=address")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:bg-gray-400"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};

const EditAddressPage = () => {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12">
        <Suspense fallback={<Loading />}>
          <EditAddressContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default EditAddressPage;
