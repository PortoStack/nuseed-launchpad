import type { TagCatalogItem } from "@/types/requirement";

export const MAIN_CATEGORIES = [
  {
    id: "main-technology",
    label: { th: "เทคโนโลยี", en: "Technology" },
  },
  {
    id: "main-health",
    label: { th: "สุขภาพ", en: "Health" },
  },
  {
    id: "main-agriculture-food",
    label: {
      th: "เกษตรและการแปรรูปอาหาร",
      en: "Agriculture and Food Processing",
    },
  },
  {
    id: "main-automotive-transport",
    label: { th: "ยานยนต์และการขนส่ง", en: "Automotive and Transport" },
  },
  {
    id: "main-energy-materials",
    label: { th: "พลังงานและวัสดุ", en: "Energy and Materials" },
  },
  {
    id: "main-tourism-services",
    label: { th: "การท่องเที่ยวและบริการ", en: "Tourism and Services" },
  },
  {
    id: "main-manufacturing-industry",
    label: {
      th: "การผลิตและอุตสาหกรรมพื้นฐาน",
      en: "Manufacturing and Basic Industries",
    },
  },
  {
    id: "main-real-estate-infrastructure",
    label: {
      th: "อสังหาริมทรัพย์และโครงสร้างพื้นฐาน",
      en: "Real Estate and Infrastructure",
    },
  },
] as const;

export type MainCategoryId = (typeof MAIN_CATEGORIES)[number]["id"];

type TaxonomySeed = {
  id: string;
  mainCategoryId: MainCategoryId;
  label: { th: string; en: string };
  keywords: string[];
  isFlagship?: boolean;
};

const TAXONOMY_SEEDS: readonly TaxonomySeed[] = [
  {
    id: "tag-smart-electronics",
    mainCategoryId: "main-technology",
    label: { th: "อิเล็กทรอนิกส์อัจฉริยะ", en: "Smart Electronics" },
    keywords: ["อิเล็กทรอนิกส์", "smart electronics", "วงจรอัจฉริยะ"],
  },
  {
    id: "tag-digital",
    mainCategoryId: "main-technology",
    label: { th: "ดิจิทัล", en: "Digital" },
    keywords: ["ดิจิทัล", "digital", "แพลตฟอร์ม"],
  },
  {
    id: "tag-it-software-digital-content",
    mainCategoryId: "main-technology",
    label: {
      th: "ด้านเทคโนโลยีสารสนเทศ (IT Software and Digital Content)",
      en: "IT Software and Digital Content",
    },
    keywords: ["ซอฟต์แวร์", "software", "digital content", "เทคโนโลยีสารสนเทศ"],
  },
  {
    id: "tag-industrial-robotics",
    mainCategoryId: "main-technology",
    label: { th: "หุ่นยนต์เพื่ออุตสาหกรรม", en: "Industrial Robotics" },
    keywords: ["หุ่นยนต์", "robotics", "robot"],
  },
  {
    id: "tag-integrated-medicine",
    mainCategoryId: "main-health",
    label: { th: "การแพทย์ครบวงจร", en: "Integrated Medicine" },
    keywords: ["การแพทย์ครบวงจร", "integrated medicine"],
  },
  {
    id: "tag-medical-biotechnology",
    mainCategoryId: "main-health",
    label: {
      th: "ด้านการแพทย์และเทคโนโลยีชีวภาพ",
      en: "Medical and Biotechnology",
    },
    keywords: ["การแพทย์", "ชีวภาพ", "medical", "biotechnology"],
  },
  {
    id: "tag-cosmetics-cosmeceuticals",
    mainCategoryId: "main-health",
    label: {
      th: "เครื่องสำอางและเวชสำอาง",
      en: "Cosmetics and Cosmeceuticals",
    },
    keywords: ["เครื่องสำอาง", "เวชสำอาง", "cosmetics"],
  },
  {
    id: "tag-agriculture-biotechnology",
    mainCategoryId: "main-agriculture-food",
    label: {
      th: "การเกษตรและเทคโนโลยีชีวภาพ",
      en: "Agriculture and Biotechnology",
    },
    keywords: ["เกษตร", "การเกษตร", "ชีวภาพ", "agriculture"],
  },
  {
    id: "tag-food-processing",
    mainCategoryId: "main-agriculture-food",
    label: { th: "การแปรรูปอาหาร", en: "Food Processing" },
    keywords: ["แปรรูปอาหาร", "แปรรูป", "food processing", "อาหาร"],
  },
  {
    id: "tag-rice-whole-chain",
    mainCategoryId: "main-agriculture-food",
    label: { th: "ข้าวทั้งห่วงโซ่", en: "Rice Whole Chain" },
    keywords: ["ข้าว", "rice", "ห่วงโซ่ข้าว"],
    isFlagship: true,
  },
  {
    id: "tag-modern-automotive",
    mainCategoryId: "main-automotive-transport",
    label: { th: "ยานยนต์สมัยใหม่", en: "Modern Automotive" },
    keywords: ["ยานยนต์สมัยใหม่", "รถยนต์ไฟฟ้า", "automotive"],
  },
  {
    id: "tag-aviation-logistics",
    mainCategoryId: "main-automotive-transport",
    label: { th: "การบินและโลจิสติกส์", en: "Aviation and Logistics" },
    keywords: ["การบิน", "โลจิสติกส์", "aviation", "logistics"],
  },
  {
    id: "tag-biofuels-biochemicals",
    mainCategoryId: "main-energy-materials",
    label: {
      th: "เชื้อเพลิงชีวภาพและเคมีชีวภาพ",
      en: "Biofuels and Biochemicals",
    },
    keywords: ["เชื้อเพลิงชีวภาพ", "เคมีชีวภาพ", "biofuel"],
  },
  {
    id: "tag-renewable-energy-materials",
    mainCategoryId: "main-energy-materials",
    label: {
      th: "ด้านเทคโนโลยีพลังงานทดแทนและวัสดุ",
      en: "Renewable Energy Technology and Materials",
    },
    keywords: [
      "พลังงานทดแทน",
      "พลังงานแสงอาทิตย์",
      "วัสดุ",
      "renewable energy",
    ],
  },
  {
    id: "tag-high-income-tourism",
    mainCategoryId: "main-tourism-services",
    label: { th: "ท่องเที่ยวกลุ่มรายได้ดี", en: "High-Income Tourism" },
    keywords: ["ท่องเที่ยวกลุ่มรายได้ดี", "ท่องเที่ยวคุณภาพ", "tourism"],
  },
  {
    id: "tag-wellness-tourism",
    mainCategoryId: "main-tourism-services",
    label: { th: "การท่องเที่ยวเชิงสุขภาพ", en: "Wellness Tourism" },
    keywords: ["ท่องเที่ยวเชิงสุขภาพ", "wellness tourism", "สุขภาพ"],
  },
  {
    id: "tag-machinery-mining",
    mainCategoryId: "main-manufacturing-industry",
    label: { th: "เครื่องจักรกลและเหมืองแร่", en: "Machinery and Mining" },
    keywords: ["เครื่องจักรกล", "เหมืองแร่", "machinery", "mining"],
  },
  {
    id: "tag-textiles",
    mainCategoryId: "main-manufacturing-industry",
    label: { th: "สิ่งทอ", en: "Textiles" },
    keywords: ["สิ่งทอ", "ผ้า", "textiles"],
  },
  {
    id: "tag-real-estate-construction",
    mainCategoryId: "main-real-estate-infrastructure",
    label: {
      th: "อสังหาริมทรัพย์และการก่อสร้าง",
      en: "Real Estate and Construction",
    },
    keywords: ["อสังหาริมทรัพย์", "ก่อสร้าง", "real estate", "construction"],
  },
];

const categoryById = new Map(
  MAIN_CATEGORIES.map((category) => [category.id, category])
);
const seedById = new Map(TAXONOMY_SEEDS.map((tag) => [tag.id, tag]));
const categoryOrder = new Map(
  MAIN_CATEGORIES.map((category, index) => [category.id, index])
);

export const TAXONOMY_TAGS: readonly TagCatalogItem[] = TAXONOMY_SEEDS.map(
  (tag) => {
    const category = categoryById.get(tag.mainCategoryId)!;
    return {
      id: tag.id,
      label: tag.label.th,
      kind: "business",
      keywords: tag.keywords,
      mainCategoryId: tag.mainCategoryId,
      mainCategoryLabel: category.label.th,
      parentCategory: category.label.th,
      isFlagship: Boolean(tag.isFlagship),
      source: "system",
      status: "active",
    } satisfies TagCatalogItem;
  }
);

export function getTaxonomyTag(id: string): TagCatalogItem | undefined {
  return TAXONOMY_TAGS.find((tag) => tag.id === id);
}

export function getLocalizedTaxonomyTagLabel(
  id: string,
  locale: "th" | "en"
): string | undefined {
  return seedById.get(id)?.label[locale];
}

export function getMainCategory(id: string) {
  return categoryById.get(id as MainCategoryId);
}

export function getChildTagsForCategory(
  categoryId: string,
  catalog: readonly { id: string; mainCategoryId?: string }[] = TAXONOMY_TAGS
): string[] {
  return catalog
    .filter((tag) => tag.mainCategoryId === categoryId)
    .map((tag) => tag.id);
}

export function expandSelectionToTagIds(
  selection: {
    categoryIds: string[];
    tagIds: string[];
  },
  catalog: readonly { id: string; mainCategoryId?: string }[] = TAXONOMY_TAGS
): string[] {
  return Array.from(
    new Set([
      ...selection.categoryIds.flatMap((id) =>
        getChildTagsForCategory(id, catalog)
      ),
      ...selection.tagIds,
    ])
  );
}

export function normalizeTagCatalogItem(item: TagCatalogItem): TagCatalogItem {
  const seed = seedById.get(item.id);
  if (seed) {
    const category =
      categoryById.get(item.mainCategoryId ?? seed.mainCategoryId) ??
      categoryById.get(seed.mainCategoryId)!;
    return {
      ...item,
      label: seed.label.th,
      kind: item.kind ?? "business",
      keywords: item.keywords?.length ? item.keywords : seed.keywords,
      mainCategoryId: category.id,
      mainCategoryLabel: category.label.th,
      parentCategory: category.label.th,
      isFlagship: Boolean(seed.isFlagship),
    };
  }

  const categoryId = item.mainCategoryId;
  const category = categoryId ? categoryById.get(categoryId) : undefined;
  return {
    ...item,
    kind: item.kind ?? "business",
    mainCategoryId: category?.id,
    mainCategoryLabel: item.mainCategoryLabel ?? category?.label.th,
    parentCategory: item.parentCategory ?? category?.label.th,
    isFlagship: Boolean(item.isFlagship),
  };
}

export function sortTaxonomyTags<T extends TagCatalogItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aSeed = seedById.get(a.id);
    const bSeed = seedById.get(b.id);
    const aCategory = a.mainCategoryId ?? aSeed?.mainCategoryId;
    const bCategory = b.mainCategoryId ?? bSeed?.mainCategoryId;
    const categoryDifference =
      (categoryOrder.get(aCategory as MainCategoryId) ??
        Number.MAX_SAFE_INTEGER) -
      (categoryOrder.get(bCategory as MainCategoryId) ??
        Number.MAX_SAFE_INTEGER);
    if (categoryDifference !== 0) return categoryDifference;

    const aIndex = aSeed
      ? TAXONOMY_SEEDS.findIndex((tag) => tag.id === a.id)
      : Number.MAX_SAFE_INTEGER;
    const bIndex = bSeed
      ? TAXONOMY_SEEDS.findIndex((tag) => tag.id === b.id)
      : Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) return aIndex - bIndex;

    return (a.createdAt ?? a.id).localeCompare(b.createdAt ?? b.id);
  });
}

export function canonicalLabelForId(id: string): string | undefined {
  return seedById.get(id)?.label.th;
}
