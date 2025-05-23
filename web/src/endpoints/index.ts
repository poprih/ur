import { neon } from "@neondatabase/serverless";

const DATABASE_URL = import.meta.env.DATABASE_URL;

export const getRegions = async () => {
  const sql = neon(DATABASE_URL);
  const regions = await sql`SELECT * FROM regions`;
  return regions;
};

export const getPrefectures = async (regionId?: string) => {
  const sql = neon(DATABASE_URL);
  const prefectures = await sql`
    SELECT
      r.id as region_id,
      r.code as region_code,
      r.name as region_name,
      p.id as id,
      p.code as code,
      p.name as name
    FROM regions r
    JOIN prefectures p ON p.region_id = r.id
    ${regionId ? sql`WHERE r.id = ${regionId}` : sql``}
    ORDER BY r.code, p.code
    `;
  return prefectures;
};
export interface IAreaWithSkcs {
  id: string;
  name: string;
  ur_area_code: string;
  skcs: {
    id: string;
    code: string;
    name: string;
  }[];
}
export const getAreasWithSkcs: (
  prefectureId: string
) => Promise<IAreaWithSkcs[]> = async (prefectureId: string) => {
  const sql = neon(DATABASE_URL);
  const results = await sql`
    SELECT 
      a.id as id,
      a.name as name,
      a.ur_area_code as ur_area_code,
      s.id as skc_id,
      s.code as skc_code,
      s.name as skc_name
    FROM areas a
    LEFT JOIN skcs s ON s.area_id = a.id
    WHERE a.prefecture_id = ${prefectureId}
  `;
  // Group results by area
  const areasMap = new Map();
  results.forEach((row) => {
    if (!areasMap.has(row.id)) {
      areasMap.set(row.id, {
        id: row.id,
        name: row.name,
        ur_area_code: row.ur_area_code,
        skcs: [],
      });
    }
    if (row.skc_id) {
      areasMap.get(row.id).skcs.push({
        id: row.skc_id,
        code: row.skc_code,
        name: row.skc_name,
      });
    }
  });
  return Array.from(areasMap.values());
};

export const getSkcs = async () => {
  const sql = neon(DATABASE_URL);
  const skcs = await sql`
    SELECT 
      r.id as region_id,
      r.code as region_code,
      r.name as region_name,
      p.id as prefecture_id,
      p.code as prefecture_code,
      p.name as prefecture_name,
      a.id as area_id,
      a.name as area_name,
      s.id as skc_id,
      s.code as skc_code,
      s.name as skc_name
    FROM regions r
    JOIN prefectures p ON p.region_id = r.id
    JOIN areas a ON a.prefecture_id = p.id
    JOIN skcs s ON s.area_id = a.id
  `;
  return skcs;
};

export interface IUrProperty {
  id: string;
  name: string;
  code: string;
  region: {
    id: string;
    code: string;
    name: string;
  };
  prefecture: {
    id: string;
    code: string;
    name: string;
  };
  area: {
    id: string;
    name: string;
    ur_area_code: string;
  };
  skc: {
    id: string;
    code: string;
    name: string;
  };
}

export const getUrProperties = async (skcId?: string) => {
  const sql = neon(DATABASE_URL);
  const results = await sql`
    SELECT 
      u.id,
      u.unit_name as name,
      u.unit_code as code,
      r.id as region_id,
      r.code as region_code,
      r.name as region_name,
      p.id as prefecture_id,
      p.code as prefecture_code,
      p.name as prefecture_name,
      a.id as area_id,
      a.name as area_name,
      a.ur_area_code as ur_area_code,
      s.id as skc_id,
      s.code as skc_code,
      s.name as skc_name
    FROM units u
    JOIN skcs s ON s.id = u.skc_id
    JOIN areas a ON a.id = s.area_id
    JOIN prefectures p ON p.id = a.prefecture_id
    JOIN regions r ON r.id = p.region_id
    ${skcId ? sql`WHERE s.id = ${skcId}` : sql``}
    ORDER BY r.code, p.code, a.name, s.code, u.unit_name
  `;

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    region: {
      id: row.region_id,
      code: row.region_code,
      name: row.region_name,
    },
    prefecture: {
      id: row.prefecture_id,
      code: row.prefecture_code,
      name: row.prefecture_name,
    },
    area: {
      id: row.area_id,
      name: row.area_name,
      ur_area_code: row.ur_area_code,
    },
    skc: {
      id: row.skc_id,
      code: row.skc_code,
      name: row.skc_name,
    },
  }));
};

export const getUrPropertyDetail = async (propertyCode: string) => {
  const sql = neon(DATABASE_URL);
  const result = await sql`
    SELECT * FROM units WHERE unit_code = ${propertyCode}
  `;
  return result;
};
