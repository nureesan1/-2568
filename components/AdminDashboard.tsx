import React, { useEffect, useState, useMemo } from 'react';
import { SurveyData, DamageLevel } from '../types';
import { fetchSurveysFromSheet } from '../services/sheetService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [selectedDamage, setSelectedDamage] = useState<string>('All');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchSurveysFromSheet();
      setData(result);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesText = item.fullName.includes(filterText) || item.area.includes(filterText) || item.idCard.includes(filterText);
      const matchesDamage = selectedDamage === 'All' || item.damageLevel.includes(selectedDamage);
      return matchesText && matchesDamage;
    });
  }, [data, filterText, selectedDamage]);

  // Chart Data Preparation
  const damageStats = useMemo(() => {
    const stats = {
      'Level 1': 0,
      'Level 2': 0,
      'Level 3': 0,
      'Level 4': 0,
    };
    data.forEach(item => {
      if (item.damageLevel.includes('Level 1')) stats['Level 1']++;
      else if (item.damageLevel.includes('Level 2')) stats['Level 2']++;
      else if (item.damageLevel.includes('Level 3')) stats['Level 3']++;
      else if (item.damageLevel.includes('Level 4')) stats['Level 4']++;
    });
    return Object.keys(stats).map(key => ({ name: key, value: stats[key as keyof typeof stats] }));
  }, [data]);

  const COLORS = ['#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'];

  const downloadCSV = () => {
    const headers = ['Timestamp', 'Type', 'Name', 'ID', 'Phone', 'Area', 'Damage', 'Damaged Items', 'Needs'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + filteredData.map(e => [
          e.timestamp, e.memberType, e.fullName, `"${e.idCard}"`, `"${e.phone}"`, e.area, e.damageLevel.split('-')[0], `"${e.damagedItems || ''}"`, `"${e.needs.join(' ')}"`
        ].join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "survey_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  const APPS_SCRIPT_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      data.timestamp,
      data.memberType,
      data.fullName,
      "'" + data.idCard,
      "'" + data.phone,
      data.address,
      data.area,
      data.damageLevel,
      data.cause,
      data.waterLevel,
      data.floodDuration,
      Array.isArray(data.needs) ? data.needs.join(", ") : data.needs,
      data.otherNeeds || "",
      data.damagedItems || "",
      data.images ? data.images.length : 0
    ];
    
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
   var rows = sheet.getDataRange().getValues();
   var headers = rows.shift(); 
   
   var data = rows.map(function(r, i) {
     return {
       id: "row-" + (i + 2),
       timestamp: r[0], 
       memberType: r[1], 
       fullName: r[2], 
       idCard: r[3],
       phone: r[4], 
       address: r[5], 
       area: r[6], 
       damageLevel: r[7],
       cause: r[8], 
       waterLevel: r[9], 
       floodDuration: r[10], 
       needs: r[11] ? r[11].toString().split(", ") : [],
       otherNeeds: r[12],
       damagedItems: r[13],
       images: [] 
     };
   });
   
   return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
}`;

  if (loading) return <div className="p-8 text-center text-blue-600 font-semibold">กำลังโหลดข้อมูล Dashboard...</div>;

  return (
    <div className="space-y-6 relative">
      
      {/* Header Actions */}
      <div className="flex justify-end">
         <button 
           onClick={() => setShowGuide(true)}
           className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 transition"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
           วิธีเชื่อมต่อ Google Sheet
         </button>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">คู่มือการติดตั้ง Google Sheets</h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                   <div>
                     <p className="font-semibold">สร้าง Google Sheet ใหม่</p>
                     <p className="text-sm text-slate-600">ตั้งชื่อหัวข้อในแถวแรกดังนี้: <br/><code className="bg-slate-100 px-1 rounded text-xs">Timestamp, Member Type, Name, ID Card, Phone, Address, Area, Damage Level, Cause, Water Level, Duration, Needs, Other Needs, Damaged Items, Images Count</code></p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                   <div>
                     <p className="font-semibold">เปิด Apps Script</p>
                     <p className="text-sm text-slate-600">ไปที่เมนู <b>Extensions (ส่วนขยาย)</b> {'>'} <b>Apps Script</b></p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                   <div>
                     <p className="font-semibold">วางโค้ดด้านล่าง</p>
                     <p className="text-sm text-slate-600">ลบโค้ดเดิมทั้งหมดใน <code>Code.gs</code> แล้ววางโค้ดชุดนี้ลงไป:</p>
                     <div className="relative mt-2">
                       <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg text-xs overflow-x-auto h-64 select-all">
                         {APPS_SCRIPT_CODE}
                       </pre>
                       <button 
                         onClick={() => navigator.clipboard.writeText(APPS_SCRIPT_CODE)}
                         className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-xs"
                       >
                         Copy Code
                       </button>
                     </div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                   <div>
                     <p className="font-semibold">Deploy (ทำให้ใช้งานได้)</p>
                     <ul className="list-disc ml-4 text-sm text-slate-600 mt-1 space-y-1">
                       <li>กดปุ่ม <b>Deploy</b> (สีน้ำเงินมุมขวาบน) {'>'} <b>New Deployment</b></li>
                       <li>กดรูปเฟือง {'>'} เลือก <b>Web App</b></li>
                       <li>Description: ใส่ชื่ออะไรก็ได้</li>
                       <li>Execute as: <b>Me (ฉัน)</b></li>
                       <li>Who has access: <b>Anyone (ทุกคน)</b> <span className="text-red-500">*สำคัญมาก</span></li>
                       <li>กด <b>Deploy</b> แล้วคัดลอก <b>Web App URL</b></li>
                     </ul>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">5</div>
                   <div>
                     <p className="font-semibold">นำ URL มาใส่ในระบบ</p>
                     <p className="text-sm text-slate-600">เปิดไฟล์ <code>services/sheetService.ts</code> แล้ววาง URL ในตัวแปร <code>GOOGLE_SCRIPT_URL</code></p>
                   </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-slate-500 text-sm">ผู้ลงทะเบียนทั้งหมด</p>
          <p className="text-2xl font-bold text-slate-800">{data.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-slate-500 text-sm">วิกฤต (Level 4)</p>
          <p className="text-2xl font-bold text-slate-800">{damageStats.find(d => d.name === 'Level 4')?.value || 0}</p>
        </div>
         <div className="bg-white p-4 rounded-xl shadow border-l-4 border-orange-500">
          <p className="text-slate-500 text-sm">รุนแรง (Level 3)</p>
          <p className="text-2xl font-bold text-slate-800">{damageStats.find(d => d.name === 'Level 3')?.value || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-slate-500 text-sm">ปานกลาง/น้อย</p>
          <p className="text-2xl font-bold text-slate-800">{(damageStats.find(d => d.name === 'Level 1')?.value || 0) + (damageStats.find(d => d.name === 'Level 2')?.value || 0)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold text-slate-800 mb-4">สัดส่วนความเสียหาย</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={damageStats} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {damageStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold text-slate-800 mb-4">จำนวนผู้ประสบภัยแยกตามระดับ</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={damageStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, พื้นที่, เลขบัตร..." 
              className="p-2 border border-slate-300 rounded-lg w-full md:w-64"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <select 
              className="p-2 border border-slate-300 rounded-lg"
              value={selectedDamage}
              onChange={(e) => setSelectedDamage(e.target.value)}
            >
              <option value="All">ทุกระดับความเสียหาย</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
            </select>
          </div>
          <button 
            onClick={downloadCSV}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-sm uppercase tracking-wider">
                <th className="p-3 font-semibold border-b">วันที่</th>
                <th className="p-3 font-semibold border-b">ชื่อ-สกุล</th>
                <th className="p-3 font-semibold border-b">พื้นที่</th>
                <th className="p-3 font-semibold border-b">ระดับความเสียหาย</th>
                <th className="p-3 font-semibold border-b">ทรัพย์สินเสียหาย</th>
                <th className="p-3 font-semibold border-b">เบอร์โทร</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 text-sm">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50 border-b border-slate-100">
                  <td className="p-3">{new Date(row.timestamp).toLocaleDateString('th-TH')}</td>
                  <td className="p-3 font-medium text-slate-800">{row.fullName}</td>
                  <td className="p-3">{row.area}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.damageLevel.includes('Level 4') ? 'bg-red-100 text-red-700' :
                      row.damageLevel.includes('Level 3') ? 'bg-orange-100 text-orange-700' :
                      row.damageLevel.includes('Level 2') ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {row.damageLevel.split(' - ')[0]}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate" title={row.damagedItems}>{row.damagedItems || '-'}</td>
                  <td className="p-3">{row.phone}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;