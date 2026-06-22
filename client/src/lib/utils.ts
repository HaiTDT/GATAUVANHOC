/**
 * Converts a Vietnamese string to a clean URL-friendly slug.
 */
export function toSlug(str: string): string {
  if (!str) return "";

  // Convert to lowercase
  let slug = str.toLowerCase();

  // Remove Vietnamese diacritics / accents
  slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a");
  slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, "e");
  slug = slug.replace(/[íìỉĩị]/g, "i");
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o");
  slug = slug.replace(/[úùủũụưứừửữự]/g, "u");
  slug = slug.replace(/[ýỳỷỹỵ]/g, "y");
  slug = slug.replace(/đ/g, "d");

  // Replace spaces, special characters, and non-alphanumeric chars with a single dash
  slug = slug.replace(/[^a-z0-9 -]/g, "") // Remove all non-alphanumeric (except spaces/dashes)
             .replace(/\s+/g, "-")           // Replace spaces with dash
             .replace(/-+/g, "-")            // Collapse multiple dashes
             .replace(/^-+/, "")             // Trim dashes from start
             .replace(/-+$/, "");            // Trim dashes from end

  return slug;
}
