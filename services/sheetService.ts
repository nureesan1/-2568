import { SurveyData, MemberType, DamageLevel } from '../types';

// ==========================================================================================
// ⚙️ CONFIGURATION: GOOGLE SHEETS CONNECTION
// ==========================================================================================
// 1. Deploy your Google Apps Script as a Web App (Execute as: Me, Access: Anyone).
// 2. Paste the Web App URL inside the quotes below.
//    Example: "https://script.google.com/macros/s/AKfycbx.../exec"
// ==========================================================================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEkrOJMs08BmUAVWHJVPU8Rt6zzOKpz57rz76kTTJUBND3G0sU6Xa47qra8E3XxoatLg/exec"; 
// ==========================================================================================

/**
 * ==========================================
 * GOOGLE APPS SCRIPT (BACKEND) INSTRUCTIONS
 * ==========================================
 * 
 * Paste this into Code.gs in your Google Sheet's Apps Script editor:
 * 
 * ```javascript
 * function doPost(e) {
 *   const lock = LockService.getScriptLock();
 *   lock.tryLock(10000);
 * 
 *   try {
 *     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     const data = JSON.parse(e.postData.contents);
 *     
 *     const row = [
 *       data.timestamp,
 *       data.memberType,
 *       data.fullName,
 *       "'" + data.idCard, // Force string for ID
 *       "'" + data.phone,  // Force string for Phone
 *       data.address,
 *       data.area,
 *       data.damageLevel,
 *       data.cause,
 *       data.waterLevel,
 *       data.floodDuration,
 *       Array.isArray(data.needs) ? data.needs.join(", ") : data.needs,
 *       data.otherNeeds || "",
 *       data.damagedItems || "", // New column for Damaged Items
 *       data.images.length // Just count images for now
 *     ];
 *     
 *     // Append row to the bottom of the sheet
 *     sheet.appendRow(row);
 * 
 *     return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch (e) {
 *     return ContentService.createTextOutput(JSON.stringify({ result: "error", error: e.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } finally {
 *     lock.releaseLock();
 *   }
 * }
 * 
 * function doGet(e) {
 *    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *    const rows = sheet.getDataRange().getValues();
 *    // Assume first row is header, remove it
 *    const headers = rows.shift(); 
 *    
 *    // Map array to object
 *    const data = rows.map((r, i) => ({
 *      id: "row-" + (i + 2),
 *      timestamp: r[0], 
 *      memberType: r[1], 
 *      fullName: r[2], 
 *      idCard: r[3],
 *      phone: r[4], 
 *      address: r[5], 
 *      area: r[6], 
 *      damageLevel: r[7],
 *      cause: r[8], 
 *      waterLevel: r[9], 
 *      floodDuration: r[10], 
 *      needs: r[11] ? r[11].toString().split(", ") : [],
 *      otherNeeds: r[12],
 *      damagedItems: r[13], // Map new column
 *      images: [] 
 *    }));
 *    
 *    return ContentService.createTextOutput(JSON.stringify(data))
 *       .setMimeType(ContentService.MimeType.JSON);
 * }
 * ```
 */

// MOCK DATA GENERATOR (Fallback)
const generateMockData = (): SurveyData[] => {
  const mockData: SurveyData[] = [];
  for (let i = 0; i < 15; i++) {
    mockData.push({
      id: `mock-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      memberType: Math.random() > 0.5 ? MemberType.REGULAR : MemberType.ASSOCIATE,
      fullName: `ผู้ประสบภัย ตัวอย่าง ${i + 1}`,
      idCard: `123456789012${i}`,
      phone: `081234567${i}`,
      address: `99/${i} หมู่ ${i % 5 + 1} ต.ตัวอย่าง`,
      area: ['บ้านดอน', 'หนองน้ำ', 'ทุ่งนา', 'ตลาดเก่า'][i % 4],
      damageLevel: Object.values(DamageLevel)[Math.floor(Math.random() * 4)],
      cause: 'น้ำป่าไหลหลาก',
      waterLevel: `${Math.floor(Math.random() * 200)} ซม.`,
      floodDuration: `${Math.floor(Math.random() * 7)} วัน`,
      needs: ['อาหาร', 'น้ำดื่ม'],
      otherNeeds: '',
      damagedItems: 'ตู้เย็น, ทีวี, ที่นอน',
      images: []
    });
  }
  return mockData;
};

export const submitSurveyToSheet = async (data: SurveyData): Promise<boolean> => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("⚠️ GOOGLE_SCRIPT_URL not set. Using mock submission.");
    return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
  }

  try {
    // Send using no-cors to avoid CORS preflight issues with simple GAS deployments
    // Note: We won't get a JSON response back in no-cors mode, but the data will be sent.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return true;
  } catch (error) {
    console.error("Error submitting to Google Sheet:", error);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Sheet");
    return false;
  }
};

export const fetchSurveysFromSheet = async (): Promise<SurveyData[]> => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("⚠️ GOOGLE_SCRIPT_URL not set. Using mock data.");
    return new Promise((resolve) => setTimeout(() => resolve(generateMockData()), 1000));
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const data = await response.json();
    
    // Validate/Transform data if necessary
    return data.map((item: any) => ({
      ...item,
      // Ensure arrays are arrays (GAS might return strings if not careful)
      needs: Array.isArray(item.needs) ? item.needs : (item.needs ? item.needs.split(",") : []),
      images: item.images || []
    }));
  } catch (error) {
    console.error("Error fetching from Google Sheet:", error);
    // Fallback to mock data so the UI doesn't break completely for the user
    return generateMockData();
  }
};