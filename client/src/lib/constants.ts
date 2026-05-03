export const CATEGORY_GROUPS = [
  {
    key: 'cham-soc-da',
    label: 'Chăm sóc da',
    categorySlugs: ['kem-chong-nang', 'mat-na', 'sua-rua-mat', 'tay-trang-mat', 'toner-nuoc-hoa-hong', 'serum-tinh-chat', 'kem-duong-am'],
    topBrands: ["Cocoon", "La Roche-Posay", "Vichy", "Kiehl's"],
  },
  {
    key: 'trang-diem',
    label: 'Trang điểm',
    categorySlugs: ['trang-diem-moi', 'trang-diem-mat', 'trang-diem-vung-mat', 'phan-ma-hong'],
    topBrands: ["Maybelline", "L'Oreal", "M.A.C", "NARS"],
  },
  {
    key: 'cham-soc-toc',
    label: 'Chăm sóc tóc',
    categorySlugs: ['dau-goi-va-dau-xa', 'dau-xit-duong-toc', 'kem-u-toc'],
    topBrands: ["TRESemmé", "Pantene", "L'Oreal", "Dove"],
  },
  {
    key: 'cham-soc-co-the',
    label: 'Chăm sóc cơ thể',
    categorySlugs: ['sua-tam', 'duong-the', 'cham-soc-rang-mieng', 'lan-xit-khu-mui', 'tay-te-bao-chet'],
    topBrands: ["Vaseline", "Nivea", "Dove", "P/S"],
  },
  {
    key: 'nuoc-hoa',
    label: 'Nước hoa',
    categorySlugs: ['nuoc-hoa', 'xit-thom-body'],
    topBrands: ["Dior", "Chanel", "Versace", "Gucci"],
  },
  {
    key: 'thuc-pham-chuc-nang',
    label: 'Thực phẩm chức năng',
    categorySlugs: ['collagen', 'vitamin-vien-uong'],
    topBrands: ["DHC", "Blackmores", "Nature's Way", "Shiseido"],
  },
] as const;

export type GroupKey = typeof CATEGORY_GROUPS[number]['key'];
