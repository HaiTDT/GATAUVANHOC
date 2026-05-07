"use client";

import React, { useState, useEffect } from "react";

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

interface VietnamAddressSelectorProps {
  onSelect: (address: { province: string; district: string; ward: string }) => void;
  initialValues?: { province: string; district: string; ward: string };
  className?: string;
}

export const VietnamAddressSelector: React.FC<VietnamAddressSelectorProps> = ({
  onSelect,
  initialValues,
  className = ""
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>(initialValues?.province || "");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialValues?.district || "");
  const [selectedWard, setSelectedWard] = useState<string>(initialValues?.ward || "");

  // Sync initialValues to state when they change externally (e.g. address book selection)
  useEffect(() => {
    if (initialValues) {
      if (initialValues.province !== undefined && initialValues.province !== selectedProvince) {
        setSelectedProvince(initialValues.province);
      }
      if (initialValues.district !== undefined && initialValues.district !== selectedDistrict) {
        setSelectedDistrict(initialValues.district);
      }
      if (initialValues.ward !== undefined && initialValues.ward !== selectedWard) {
        setSelectedWard(initialValues.ward);
      }
    }
  }, [initialValues?.province, initialValues?.district, initialValues?.ward]);

  // Fetch Provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to fetch provinces", err));
  }, []);

  // Fetch Districts when selectedProvince changes
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find((p) => p.name === selectedProvince);
      if (province) {
        fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
          .then((res) => res.json())
          .then((data) => {
            setDistricts(data.districts || []);
            // Check if current district is valid in new province
            if (selectedDistrict && !data.districts.some((d: District) => d.name === selectedDistrict)) {
              // Only reset and notify if this wasn't caused by a prop sync
              if (selectedDistrict !== initialValues?.district) {
                setSelectedDistrict("");
                setSelectedWard("");
                onSelect({ province: selectedProvince, district: "", ward: "" });
              }
            }
          });
      }
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince, provinces, onSelect]); // Added onSelect to deps but it's memoized

  // Fetch Wards when selectedDistrict changes
  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find((d) => d.name === selectedDistrict);
      if (district) {
        fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
          .then((res) => res.json())
          .then((data) => {
            setWards(data.wards || []);
            if (selectedWard && !data.wards.some((w: Ward) => w.name === selectedWard)) {
              if (selectedWard !== initialValues?.ward) {
                setSelectedWard("");
                onSelect({ province: selectedProvince, district: selectedDistrict, ward: "" });
              }
            }
          });
      }
    } else {
      setWards([]);
    }
  }, [selectedDistrict, districts, onSelect, selectedProvince]);

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict("");
    setSelectedWard("");
    onSelect({ province, district: "", ward: "" });
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedWard("");
    onSelect({ province: selectedProvince, district, ward: "" });
  };

  const handleWardChange = (ward: string) => {
    setSelectedWard(ward);
    onSelect({ province: selectedProvince, district: selectedDistrict, ward });
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Tỉnh / Thành phố</label>
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none cursor-pointer pr-10"
            required
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-lg">
            expand_more
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Quận / Huyện</label>
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedProvince}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none cursor-pointer pr-10 disabled:opacity-50"
            required
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-lg">
            expand_more
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Phường / Xã</label>
        <div className="relative">
          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={!selectedDistrict}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none cursor-pointer pr-10 disabled:opacity-50"
            required
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map((w) => (
              <option key={w.code} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-lg">
            expand_more
          </span>
        </div>
      </div>
    </div>
  );
};
