import React, { useState, ChangeEvent, FormEvent } from 'react';
import { MemberType, DamageLevel, SurveyData } from '../types';
import { submitSurveyToSheet } from '../services/sheetService';

const SurveyForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SurveyData>>({
    memberType: MemberType.REGULAR,
    needs: [],
    images: []
  });

  const [previews, setPreviews] = useState<string[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let updatedNeeds = formData.needs ? [...formData.needs] : [];
    if (checked) {
      updatedNeeds.push(value);
    } else {
      updatedNeeds = updatedNeeds.filter(item => item !== value);
    }
    setFormData(prev => ({ ...prev, needs: updatedNeeds }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // In a real app, you might upload these to Cloudinary/Firebase here
      // For this demo, we just create local previews
      const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
      setPreviews(prev => [...prev, ...newPreviews]);
      // We are just simulating "saving" the file data
      setFormData(prev => ({...prev, images: newPreviews})); 
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.idCard || !formData.phone) {
      alert("กรุณากรอกข้อมูลสำคัญให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      const submission: SurveyData = {
        ...formData as SurveyData,
        id: new Date().getTime().toString(),
        timestamp: new Date().toISOString()
      };
      
      await submitSurveyToSheet(submission);
      setSuccess(true);
      setFormData({ memberType: MemberType.REGULAR, needs: [], images: [], damagedItems: '', otherNeeds: '' });
      setPreviews([]);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ส่งข้อมูลสำเร็จ!</h2>
        <p className="text-slate-600 mb-6">ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบต่อไป</p>
        <button onClick={() => setSuccess(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          ส่งข้อมูลเพิ่มเติม
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-blue-600 p-6 text-white">
        <h2 className="text-xl font-bold">แบบสำรวจผู้ประสบภัยน้ำท่วม</h2>
        <p className="text-blue-100 text-sm mt-1">กรุณากรอกข้อมูลตามความจริงเพื่อขอรับความช่วยเหลือ</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Section 1: ข้อมูลสมาชิก */}
        <section>
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">1. ข้อมูลสมาชิก</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทสมาชิก</label>
              <select name="memberType" value={formData.memberType} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value={MemberType.REGULAR}>สมาชิกสามัญ</option>
                <option value={MemberType.ASSOCIATE}>สมาชิกสมทบ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เลขบัตรประชาชน</label>
              <input type="text" name="idCard" required maxLength={13} placeholder="เลข 13 หลัก" onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ - นามสกุล</label>
              <input type="text" name="fullName" required placeholder="นาย/นาง/นางสาว..." onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
              <input type="tel" name="phone" required placeholder="08x-xxx-xxxx" onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">พื้นที่/ชุมชน/หมู่บ้าน</label>
              <input type="text" name="area" required placeholder="ระบุชื่อหมู่บ้าน" onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่ที่ได้รับผลกระทบ</label>
              <textarea name="address" rows={2} required placeholder="บ้านเลขที่, ซอย, ถนน..." onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
          </div>
        </section>

        {/* Section 2: ระดับความเสียหาย */}
        <section>
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">2. ระดับความเสียหาย (Damage Level)</h3>
          <div className="space-y-3">
            {Object.entries(DamageLevel).map(([key, label]) => (
              <label key={key} className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${formData.damageLevel === label ? 'bg-blue-50 border-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="damageLevel" value={label} checked={formData.damageLevel === label} onChange={handleInputChange} className="mt-1 mr-3 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="block font-medium text-slate-900">{label.split(' - ')[0]}</span>
                  <span className="text-sm text-slate-600">{label.split(' - ')[1]}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Section 3: รายละเอียดเพิ่มเติม */}
        <section>
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">3. รายละเอียดเพิ่มเติม</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">สาเหตุ/สถานการณ์น้ำท่วม</label>
              <input type="text" name="cause" placeholder="เช่น ฝนตกหนัก, น้ำล้นตลิ่ง" onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ระดับน้ำสูงสุด</label>
              <input type="text" name="waterLevel" placeholder="ระบุเป็น ซม. หรือ เมตร" onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ระยะเวลาน้ำท่วม</label>
              <input type="text" name="floodDuration" placeholder="เช่น 3 วัน, 1 สัปดาห์" onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            {/* New Field: Damaged Items */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">ระบุสิ่งของที่เสียหาย (Damaged Items)</label>
              <textarea 
                name="damagedItems" 
                rows={3} 
                placeholder="ระบุรายการทรัพย์สินที่เสียหาย เช่น ตู้เย็น, ทีวี, ที่นอน, รถจักรยานยนต์ ฯลฯ" 
                onChange={handleInputChange} 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">ความต้องการช่วยเหลือเร่งด่วน</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['อาหาร', 'น้ำดื่ม', 'ที่พักชั่วคราว', 'ซ่อมบ้าน', 'เงินช่วยเหลือ', 'ยารักษาโรค'].map((need) => (
                  <label key={need} className="flex items-center space-x-2">
                    <input type="checkbox" value={need} onChange={handleCheckboxChange} checked={formData.needs?.includes(need)} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-slate-700">{need}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">อื่นๆ (โปรดระบุ)</label>
              <input type="text" name="otherNeeds" onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </section>

        {/* Section 4: อัปโหลดรูปภาพ */}
        <section>
          <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">4. ภาพถ่ายความเสียหาย</h3>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-1 text-sm text-slate-600">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง</p>
            <p className="mt-1 text-xs text-slate-400">รองรับ JPG, PNG (รูปบ้าน, ทรัพย์สิน, พื้นที่น้ำท่วม)</p>
          </div>
          
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {previews.map((src, index) => (
                <div key={index} className="aspect-square relative rounded-lg overflow-hidden border border-slate-200">
                  <img src={src} alt={`preview ${index}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 px-6 text-white font-semibold rounded-lg shadow-md transition-colors ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'กำลังส่งข้อมูล...' : 'ส่งแบบสำรวจ'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SurveyForm;