export const CATEGORY_GROUPS = [
  {
    key: 'cham-soc-da',
    label: 'Chăm sóc da',
    categorySlugs: ['kem-chong-nang', 'mat-na', 'sua-rua-mat', 'tay-trang-mat'],
    topBrands: ["Cocoon", "L'Oreal", "Sunplay", "La Roche-Posay"],
  },
  {
    key: 'trang-diem',
    label: 'Trang điểm',
    categorySlugs: ['trang-diem-moi', 'trang-diem-mat', 'trang-diem-vung-mat'],
    topBrands: ["Silkygirl", "Maybelline", "Judydoll", "australis"],
  },
  {
    key: 'cham-soc-co-the',
    label: 'Chăm sóc cơ thể',
    categorySlugs: ['dau-goi-va-dau-xa', 'sua-tam', 'duong-the', 'cham-soc-rang-mieng', 'dau-xit-duong-toc'],
    topBrands: ["Vaseline", "Cocoon", "Milaganics", "P/S"],
  },
  {
    key: 'clinic',
    label: 'Clinic',
    categorySlugs: ['nuoc-hoa', 'khac'],
    topBrands: ["Kiss My Body", "Dolce & Gabbana", "Foellie", "Yves Saint Laurent"],
  },
] as const;

export type GroupKey = typeof CATEGORY_GROUPS[number]['key'];
