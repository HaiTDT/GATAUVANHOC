export const CATEGORY_GROUPS = [
  {
    key: 'cham-soc-da',
    label: 'Chăm sóc da',
    categorySlugs: ['kem-chong-nang', 'mat-na', 'sua-rua-mat', 'nuoc-tay-trang', 'dau-sap-tay-trang', 'tay-trang-mat'],
    topBrands: ["Cocoon", "La Roche-Posay", "Vichy", "Kiehl's"],
  },
  {
    key: 'trang-diem',
    label: 'Trang điểm',
    categorySlugs: [
      'son-kem', 'son-duong', 'son-tint-son-bong', 'trang-diem-moi',
      'kem-nen', 'phan-nuoc-cushion', 'ma-hong', 'kem-che-khuyet-diem', 'trang-diem-mat',
      'trang-diem-vung-mat'
    ],
    topBrands: ["Maybelline", "L'Oreal", "M.A.C", "NARS"],
  },
  {
    key: 'cham-soc-toc',
    label: 'Chăm sóc tóc',
    categorySlugs: ['dau-goi-va-dau-xa', 'dau-xit-duong-toc'],
    topBrands: ["TRESemmé", "Pantene", "L'Oreal", "Dove"],
  },
  {
    key: 'cham-soc-co-the',
    label: 'Chăm sóc cơ thể',
    categorySlugs: ['sua-tam', 'duong-the', 'cham-soc-rang-mieng'],
    topBrands: ["Vaseline", "Nivea", "Dove", "P/S"],
  },
  {
    key: 'nuoc-hoa',
    label: 'Nước hoa',
    categorySlugs: ['nuoc-hoa', 'xit-thom-toan-than'],
    topBrands: ["Dior", "Chanel", "Versace", "Gucci"],
  },
] as const;

export type GroupKey = typeof CATEGORY_GROUPS[number]['key'];

