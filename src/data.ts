import { Patient, Appointment, LM6Assessment, LabResult } from './types';

export interface TestInfo {
  id: string;
  name: string;
  detail: string;
  price: number;
  refRange: string;
  unit: string;
  categories: string[];
}

export const BASIC_TESTS: Record<string, TestInfo> = {
  physical: {
    id: 'physical',
    name: 'Physical Examination',
    detail: 'ซักประวัติ ตรวจร่างกายโดยแพทย์',
    price: 0,
    refRange: 'ปกติ',
    unit: '',
    categories: ['basic']
  },
  chestXray: {
    id: 'chestXray',
    name: 'Chest X-Ray',
    detail: 'เอกซเรย์ทรวงอกเพื่อดูปอดและหัวใจ',
    price: 170,
    refRange: 'No active lung lesion, normal cardiothoracic ratio',
    unit: '',
    categories: ['basic']
  },
  cbc: {
    id: 'cbc',
    name: 'CBC (Complete Blood Count)',
    detail: 'ตรวจความสมบูรณ์ของเม็ดเลือด',
    price: 90,
    refRange: 'WBC: 4,000-11,000, Hb: M(13.0-17.5)/F(12.0-15.5), Plt: 150,000-450,000',
    unit: 'cells/uL',
    categories: ['basic']
  },
  ua: {
    id: 'ua',
    name: 'UA (Urine Analysis)',
    detail: 'ตรวจวิเคราะห์ปัสสาวะ',
    price: 50,
    refRange: 'Sp.Gr.: 1.005-1.030, pH: 5.0-8.0, Protein: Negative, Glucose: Negative',
    unit: '',
    categories: ['basic']
  },
  stoolExam: {
    id: 'stoolExam',
    name: 'Stool Exam',
    detail: 'ตรวจหาพยาธิและเซลล์เม็ดเลือดในอุจจาระ',
    price: 40,
    refRange: 'No parasite found',
    unit: '',
    categories: ['basic']
  },
  stoolOccult: {
    id: 'stoolOccult',
    name: 'Stool Occult Blood',
    detail: 'ตรวจหาเลือดปนในอุจจาระคัดกรองมะเร็งลำไส้ใหญ่',
    price: 30,
    refRange: 'Negative',
    unit: '',
    categories: ['basic']
  },
  papSmear: {
    id: 'papSmear',
    name: 'Pap Smear / ตรวจมะเร็งปากมดลูก',
    detail: 'ตรวจคัดกรองมะเร็งปากมดลูก (เฉพาะเพศหญิง)',
    price: 200,
    refRange: 'Negative for intraepithelial lesion or malignancy',
    unit: '',
    categories: ['basic', 'female_only']
  },
  fbs: {
    id: 'fbs',
    name: 'FBS (Fasting Blood Sugar)',
    detail: 'ตรวจระดับน้ำตาลในเลือดหลังจากงดอาหาร',
    price: 40,
    refRange: '70 - 99',
    unit: 'mg/dL',
    categories: ['basic', 'over35']
  },
  creatinine: {
    id: 'creatinine',
    name: 'Creatinine',
    detail: 'ตรวจการทำงานของไต (ครีอะตินีน)',
    price: 50,
    refRange: 'M: 0.70-1.20, F: 0.50-1.10',
    unit: 'mg/dL',
    categories: ['basic', 'over35']
  },
  bun: {
    id: 'bun',
    name: 'BUN (Blood Urea Nitrogen)',
    detail: 'ตรวจระดับของเสียไนโตรเจนเพื่อประเมินไต',
    price: 50,
    refRange: '8 - 20',
    unit: 'mg/dL',
    categories: ['basic', 'over35']
  },
  uricAcid: {
    id: 'uricAcid',
    name: 'Uric Acid',
    detail: 'ตรวจระดับกรดยูริกเพื่อประเมินความเสี่ยงโรคเก๊าท์',
    price: 60,
    refRange: 'M: 3.5-7.2, F: 2.6-6.0',
    unit: 'mg/dL',
    categories: ['basic', 'over35']
  },
  sgot: {
    id: 'sgot',
    name: 'SGOT (AST)',
    detail: 'ตรวจการทำงานของตับ (เอนไซม์ AST)',
    price: 50,
    refRange: '0 - 40',
    unit: 'U/L',
    categories: ['basic', 'over35']
  },
  sgpt: {
    id: 'sgpt',
    name: 'SGPT (ALT)',
    detail: 'ตรวจการทำงานของตับ (เอนไซม์ ALT)',
    price: 50,
    refRange: '0 - 40',
    unit: 'U/L',
    categories: ['basic', 'over35']
  },
  alk: {
    id: 'alk',
    name: 'Alk Phosphatase (ALP)',
    detail: 'ตรวจการทำงานของตับและกระดูก',
    price: 50,
    refRange: '40 - 130',
    unit: 'U/L',
    categories: ['basic', 'over35']
  },
  cholesterol: {
    id: 'cholesterol',
    name: 'Total Cholesterol',
    detail: 'ตรวจระดับไขมันคอเลสเตอรอลรวมในเลือด',
    price: 60,
    refRange: '< 200',
    unit: 'mg/dL',
    categories: ['basic', 'over35']
  },
  triglyceride: {
    id: 'triglyceride',
    name: 'Triglyceride',
    detail: 'ตรวจระดับไขมันไตรกลีเซอไรด์ในเลือด',
    price: 60,
    refRange: '< 150',
    unit: 'mg/dL',
    categories: ['basic', 'over35']
  }
};

export const SPECIAL_TESTS: Record<string, TestInfo> = {
  freeT3: {
    id: 'freeT3',
    name: 'Free T3',
    detail: 'ตรวจระดับฮอร์โมนไทรอยด์ T3 อิสระ',
    price: 150,
    refRange: '2.30 - 4.20',
    unit: 'pg/mL',
    categories: ['special', 'thyroid']
  },
  freeT4: {
    id: 'freeT4',
    name: 'Free T4',
    detail: 'ตรวจระดับฮอร์โมนไทรอยด์ T4 อิสระ',
    price: 170,
    refRange: '0.89 - 1.76',
    unit: 'ng/dL',
    categories: ['special', 'thyroid']
  },
  tsh: {
    id: 'tsh',
    name: 'TSH',
    detail: 'ตรวจฮอร์โมนกระตุ้นต่อมไทรอยด์',
    price: 170,
    refRange: '0.55 - 4.78',
    unit: 'uIU/mL',
    categories: ['special', 'thyroid']
  },
  hba1c: {
    id: 'hba1c',
    name: 'HbA1c',
    detail: 'ตรวจระดับน้ำตาลสะสมในเลือด ย้อนหลัง 2-3 เดือน',
    price: 150,
    refRange: '< 5.7 (เบาหวาน >= 6.5)',
    unit: '%',
    categories: ['special', 'diabetes']
  },
  hdl: {
    id: 'hdl',
    name: 'HDL-Cholesterol',
    detail: 'ตรวจวัดระดับไขมันดี มีส่วนช่วยลดความเสี่ยงหัวใจ',
    price: 100,
    refRange: '> 40 (ยิ่งสูงยิ่งดี)',
    unit: 'mg/dL',
    categories: ['special', 'lipid']
  },
  ldl: {
    id: 'ldl',
    name: 'LDL-Cholesterol',
    detail: 'ตรวจระดับไขมันเลวในเลือด สาเหตุของหลอดเลือดตีบ',
    price: 150,
    refRange: '< 130',
    unit: 'mg/dL',
    categories: ['special', 'lipid']
  },
  hpvDna: {
    id: 'hpvDna',
    name: 'HPV DNA Test',
    detail: 'ตรวจมะเร็งปากมดลูกระดับโมเลกุลคัดกรอง 14 สายพันธุ์เสี่ยงสูง',
    price: 1000,
    refRange: 'Negative',
    unit: '',
    categories: ['special', 'female_only']
  },
  ekg: {
    id: 'ekg',
    name: 'EKG / ECG',
    detail: 'ตรวจคลื่นไฟฟ้าหัวใจเพื่อหาความผิดปกติของหัวใจเบื้องต้น',
    price: 200,
    refRange: 'Normal Sinus Rhythm',
    unit: '',
    categories: ['special']
  },
  bloodGroup: {
    id: 'bloodGroup',
    name: 'Blood group ABO',
    detail: 'ตรวจเพื่อยืนยันหมู่โลหิต',
    price: 100,
    refRange: 'A / B / O / AB',
    unit: '',
    categories: ['special']
  },
  boneDensity: {
    id: 'boneDensity',
    name: 'Bone Density Test',
    detail: 'ตรวจประเมินภาวะกระดูกพรุน',
    price: 2000,
    refRange: 'T-score > -1.0',
    unit: '',
    categories: ['special']
  },
  bodyComp: {
    id: 'bodyComp',
    name: 'Body Composition Analyzer',
    detail: 'ตรวจวัดและวิเคราะห์องค์ประกอบร่างกาย (มวลกล้ามเนื้อ, ไขมัน)',
    price: 300,
    refRange: 'ขึ้นกับอายุและสัดส่วน',
    unit: '',
    categories: ['special']
  },
  ultrasoundUpper: {
    id: 'ultrasoundUpper',
    name: 'Ultrasound Upper Abdomen',
    detail: 'ตรวจอัลตราซาวด์ช่องท้องส่วนบน (ตับ, ถุงน้ำดี, ม้าม, ไตส่วนบน)',
    price: 800,
    refRange: 'ปกติ',
    unit: '',
    categories: ['special']
  },
  ultrasoundLower: {
    id: 'ultrasoundLower',
    name: 'Ultrasound Lower Abdomen',
    detail: 'ตรวจอัลตราซาวด์ช่องท้องส่วนล่าง (มดลูก, รังไข่, กระเพาะปัสสาวะ, ต่อมลูกหมาก)',
    price: 800,
    refRange: 'ปกติ',
    unit: '',
    categories: ['special']
  },
  lowDoseCt: {
    id: 'lowDoseCt',
    name: 'Low Dose CT scan',
    detail: 'เอกซเรย์คอมพิวเตอร์ช่องอกปริมาณรังสีต่ำ คัดกรองมะเร็งปอด',
    price: 4000,
    refRange: 'No suspicious pulmonary nodule',
    unit: '',
    categories: ['special']
  },
  // Cancer markers
  afp: {
    id: 'afp',
    name: 'AFP (Alpha Fetoprotein)',
    detail: 'สารบ่งชี้คัดกรองมะเร็งตับ',
    price: 250,
    refRange: '< 8.0',
    unit: 'ng/mL',
    categories: ['special', 'cancer']
  },
  cea: {
    id: 'cea',
    name: 'CEA (Carcinoembryonic Antigen)',
    detail: 'สารบ่งชี้คัดกรองมะเร็งลำไส้และระบบทางเดินอาหาร',
    price: 280,
    refRange: '< 5.0 (สำหรับคนไม่สูบบุหรี่)',
    unit: 'ng/mL',
    categories: ['special', 'cancer']
  },
  ca125: {
    id: 'ca125',
    name: 'CA 125',
    detail: 'สารบ่งชี้คัดกรองมะเร็งรังไข่ (เพศหญิง)',
    price: 550,
    refRange: '< 35',
    unit: 'U/mL',
    categories: ['special', 'cancer', 'female_only']
  },
  ca199: {
    id: 'ca199',
    name: 'CA 19-9',
    detail: 'สารบ่งชี้คัดกรองมะเร็งตับอ่อนและท่อน้ำดี',
    price: 550,
    refRange: '< 37',
    unit: 'U/mL',
    categories: ['special', 'cancer']
  },
  psa: {
    id: 'psa',
    name: 'PSA (Prostate Specific Antigen)',
    detail: 'สารบ่งชี้คัดกรองมะเร็งต่อมลูกหมาก (เพศชาย)',
    price: 300,
    refRange: '< 4.0',
    unit: 'ng/mL',
    categories: ['special', 'cancer', 'male_only']
  },
  // Hepatitis
  hbsAg: {
    id: 'hbsAg',
    name: 'HBsAg',
    detail: 'ตรวจหาการติดเชื้อไวรัสตับอักเสบบี',
    price: 130,
    refRange: 'Negative',
    unit: '',
    categories: ['special', 'hepatitis']
  },
  hbsAb: {
    id: 'hbsAb',
    name: 'HBsAb',
    detail: 'ตรวจหาภูมิคุ้มกันต่อเชื้อไวรัสตับอักเสบบี',
    price: 150,
    refRange: '> 10 (Positive = มีภูมิ)',
    unit: 'mIU/mL',
    categories: ['special', 'hepatitis']
  },
  antiHcv: {
    id: 'antiHcv',
    name: 'Anti-HCV',
    detail: 'ตรวจหาภูมิคุ้มกัน (การติดเชื้อ) ไวรัสตับอักเสบซี',
    price: 300,
    refRange: 'Negative',
    unit: '',
    categories: ['special', 'hepatitis']
  }
};

export interface LM6Question {
  id: string;
  pillar: 'nutrition' | 'physicalActivity' | 'stressManagement' | 'avoidSubstances' | 'restorativeSleep' | 'socialConnection';
  text: string;
  description: string;
}

export const LM6_PILLARS_DETAILS = {
  nutrition: {
    title: 'โภชนาการ (Nutrition)',
    desc: 'เน้นการรับประทานอาหารธรรมชาติที่ผ่านการแปรรูปน้อย (Whole Food, Plant-Based Diet) เช่น ผัก ผลไม้ ธัญพืชไม่ขัดสี ถั่วต่างๆ หลีกเลี่ยงอาหารแปรรูป หวาน มัน เค็ม',
    tips: [
      'เพิ่มสัดส่วนผักผลไม้ในมื้ออาหารให้ได้ครึ่งหนึ่งของจาน (2:1:1)',
      'ลดการทานเนื้อสัตว์แปรรูป เช่น ไส้กรอก กุนเชียง แฮม และอาหารแช่แข็ง',
      'ลดน้ำหวาน ชาไข่มุก เปลี่ยนมาดื่มน้ำเปล่าสะอาดอย่างน้อย 8 แก้วต่อวัน'
    ]
  },
  physicalActivity: {
    title: 'กิจกรรมทางกาย (Physical Activity)',
    desc: 'การขยับเขยื้อนร่างกายอย่างสม่ำเสมอ ออกกำลังกายแบบคาร์ดิโอระดับปานกลางอย่างน้อย 150 นาทีต่อสัปดาห์ ควบคู่กับการยืดเหยียดและฝึกกล้ามเนื้อต้านแรง',
    tips: [
      'เดินเร็ววันละ 30 นาที 5 วันต่อสัปดาห์ สะสมความแข็งแรงหัวใจ',
      'ยืดเหยียดกล้ามเนื้อ ป้องกันออฟฟิศซินโดรมเมื่อนั่งทำงานนานๆ ทุก 1 ชม.',
      'ฝึกเสริมความแข็งแรงกล้ามเนื้อมัดใหญ่สัปดาห์ละ 2 ครั้ง เช่น บอดี้เวท โยคะ'
    ]
  },
  stressManagement: {
    title: 'การจัดการความเครียด (Stress Management)',
    desc: 'การรับมือและลดผลกระทบเชิงลบจากความเครียดสะสม ซึ่งกระตุ้นให้ร่างกายหลั่งฮอร์โมนคอร์ติซอลอันส่งผลเสียต่อหัวใจและความดัน',
    tips: [
      'ฝึกสติ สมาธิ หรือการฝึกหายใจเข้าออกลึกๆ (4-7-8) วันละ 5-10 นาที',
      'แบ่งเวลาทำกิจกรรมผ่อนคลายหรืองานอดิเรกที่ชื่นชอบหลีกหนีหน้าจอ',
      'หากรู้สึกเครียดสะสมจนรบกวนชีวิต ควรพบนักจิตวิทยาหรือปรึกษาผู้เชี่ยวชาญ'
    ]
  },
  avoidSubstances: {
    title: 'หลีกเลี่ยงสารอันตราย (Avoidance of Risky Substances)',
    desc: 'การงดและเลิกใช้สารเสพติด สุรา ยาสูบ บุหรี่ทุกชนิด รวมถึงบุหรี่ไฟฟ้า ซึ่งเป็นปัจจัยกระตุ้นหลอดเลือดเสื่อมและโรคมะเร็ง',
    tips: [
      'หลีกเลี่ยงควันบุหรี่มือสอง และจำกัดการดื่มเครื่องดื่มแอลกอฮอล์',
      'หากต้องการเลิกบุหรี่หรือสุรา สามารถขอรับคำปรึกษาจากสายด่วนเลิกบุหรี่ 1600 หรือ สายด่วนเลิกเหล้า 1413',
      'หลีกเลี่ยงยาและผลิตภัณฑ์อาหารเสริมที่ไม่มี อย. รับรอง หรือการใช้ยาเกินความจำเป็น'
    ]
  },
  restorativeSleep: {
    title: 'การนอนหลับที่มีประสิทธิภาพ (Restorative Sleep)',
    desc: 'การพักผ่อนนอนหลับที่มีคุณภาพลึกและปริมาณที่เหมาะสม 7-8 ชั่วโมงต่อคืน เพื่อให้ร่างกายซ่อมแซมส่วนที่สึกหรอและปรับสมดุลสมอง',
    tips: [
      'เข้านอนและตื่นนอนให้ตรงเวลาเป็นประจำทุกวัน แม้ในวันหยุดเพื่อรักษานาฬิกาชีวิต',
      'จัดสิ่งแวดล้อมห้องนอนให้มืด เงียบ และเย็นสบาย หลีกเลี่ยงมือถือก่อนนอน 1 ชม.',
      'งดเครื่องดื่มที่มีคาเฟอีนและแอลกอฮอล์ในช่วงเย็นถึงก่อนนอน'
    ]
  },
  socialConnection: {
    title: 'ความสัมพันธ์ทางสังคม (Social Connection)',
    desc: 'การสร้างความสัมพันธ์ที่เกื้อกูล มีความสุข และมีความหมายต่อครอบครัว เพื่อน หรือกลุ่มเพื่อนในสังคม เพื่อช่วยส่งเสริมสุขภาพจิตและสร้างกำลังใจที่ดี',
    tips: [
      'หาเวลาติดต่อพูดคุยกับครอบครัวหรือเพื่อนสนิทอย่างใกล้ชิดและจริงใจ',
      'เข้าร่วมกิจกรรมกลุ่ม ชมรม หรือทำประโยชน์เพื่อสังคมตามความสนใจ',
      'ฝึกเป็นผู้รับฟังที่ดีและช่วยเหลือผู้อื่นตามกำลังอันเหมาะสม'
    ]
  }
};

export const LM6_QUESTIONS: LM6Question[] = [
  {
    id: 'nut1',
    pillar: 'nutrition',
    text: 'การทานผักและผลไม้สดระดับมาตรฐาน',
    description: 'ทานผักและผลไม้สดอย่างน้อย 400 กรัม (ประมาณ 4-5 ฝ่ามือ) เป็นประจำในแต่ละวัน'
  },
  {
    id: 'nut2',
    pillar: 'nutrition',
    text: 'การจำกัดอาหารแปรรูปและรสจัด',
    description: 'หลีกเลี่ยงอาหารแปรรูป (ไส้กรอก บะหมี่กึ่งสำเร็จรูป) อาหารปิ้งย่าง ทอด และหวานมันเค็มจัด'
  },
  {
    id: 'nut3',
    pillar: 'nutrition',
    text: 'การดื่มน้ำสะอาดอย่างเพียงพอ',
    description: 'ดื่มน้ำเปล่าสะอาดไม่เย็นจัด อย่างน้อย 8 แก้ว (ประมาณ 2 ลิตร) ต่อวัน'
  },
  {
    id: 'phy1',
    pillar: 'physicalActivity',
    text: 'การออกกำลังกายแบบคาร์ดิโอสม่ำเสมอ',
    description: 'ออกกำลังกายเหนื่อยปานกลาง (เช่น เดินเร็ว ปั่นจักรยาน วิ่งเบาๆ) อย่างน้อย 150 นาที/สัปดาห์'
  },
  {
    id: 'phy2',
    pillar: 'physicalActivity',
    text: 'การลดพฤติกรรมเนือยนิ่งระหว่างวัน',
    description: 'ขยับตัวบ่อยๆ ลุกยืนเดินทุกๆ 1 ชั่วโมงที่นั่งทำงาน และพยายามทำงานบ้านหรือเดินขึ้นบันไดแทนการใช้ลิฟต์'
  },
  {
    id: 'phy3',
    pillar: 'physicalActivity',
    text: 'การสร้างความแข็งแรงของกล้ามเนื้อ',
    description: 'บริหารกล้ามเนื้อด้วยแรงต้านหรือน้ำหนัก (เช่น วิดพื้น สควอท โยคะ) อย่างน้อย 2 ครั้งต่อสัปดาห์'
  },
  {
    id: 'str1',
    pillar: 'stressManagement',
    text: 'มีกลไกผ่อนคลายความตึงเครียดสะสม',
    description: 'ฝึกทำสมาธิ หายใจลึกๆ โยคะ ท่องเที่ยว หรือทำงานอดิเรกเพื่อลดระดับความกดดันจิตใจ'
  },
  {
    id: 'str2',
    pillar: 'stressManagement',
    text: 'ความรู้สึกมีความสุขและปล่อยวาง',
    description: 'สามารถจัดการกับความกังวล มองโลกในแง่บวก รู้จักปล่อยวางเรื่องรบกวนจิตใจได้รวดเร็ว'
  },
  {
    id: 'str3',
    pillar: 'stressManagement',
    text: 'การหยุดพักระหว่างวันสมดุลชีวิต',
    description: 'มีช่วงเวลาหยุดคิดหรือพักผ่อนสั้นๆ ระหว่างวันเพื่อฟื้นฟูสมาธิและการตัดสินใจ'
  },
  {
    id: 'sub1',
    pillar: 'avoidSubstances',
    text: 'การปลอดบุหรี่/บุหรี่ไฟฟ้า',
    description: 'ไม่สูบบุหรี่หรือบุหรี่ไฟฟ้า และไม่ได้รับควันบุหรี่มือสองรอบข้าง'
  },
  {
    id: 'sub2',
    pillar: 'avoidSubstances',
    text: 'การงด/จำกัดเครื่องดื่มแอลกอฮอล์',
    description: 'ไม่ดื่มเครื่องดื่มแอลกอฮอล์เลย หรือหากดื่มจะจำกัดปริมาณให้อยู่ในเกณฑ์ปลอดภัยต่อสุขภาพ'
  },
  {
    id: 'sub3',
    pillar: 'avoidSubstances',
    text: 'การปลอดสารเสพติดและการใช้ยาเสี่ยงภัย',
    description: 'ไม่ใช้สารเสพติด และไม่ซื้อยาชุดหรือยาแก้ปวดทานเองโดยไม่มีข้อบ่งชี้หรือการปรึกษาแพทย์'
  },
  {
    id: 'sle1',
    pillar: 'restorativeSleep',
    text: 'ระยะเวลาการนอนหลับที่เพียงพอ',
    description: 'นอนหลับพักผ่อนเฉลี่ยคืนละ 7-8 ชั่วโมงสม่ำเสมอ'
  },
  {
    id: 'sle2',
    pillar: 'restorativeSleep',
    text: 'สุขอนามัยที่ดีก่อนนอน (Sleep Hygiene)',
    description: 'งดเล็งจอภาพมือถือหรือคอมพิวเตอร์ก่อนนอนอย่างน้อย 1 ชั่วโมง และไม่มีเสียงหรือแสงรบกวนขณะหลับ'
  },
  {
    id: 'sle3',
    pillar: 'restorativeSleep',
    text: 'ความรู้สึกลึกและตื่นนอนสดชื่น',
    description: 'นอนหลับสนิทได้ต่อเนื่อง ไม่ตื่นกลางดึก และรู้สึกสมองโปร่งโล่งสดชื่นในตอนเช้า'
  },
  {
    id: 'soc1',
    pillar: 'socialConnection',
    text: 'การพูดคุยมีปฏิสัมพันธ์ครอบครัว/เพื่อน',
    description: 'มีเวลาคุณภาพพูดคุย แลกเปลี่ยนความรู้สึก หรือทานข้าวร่วมกับคนรัก ครอบครัว หรือเพื่อนสนิทสม่ำเสมอ'
  },
  {
    id: 'soc2',
    pillar: 'socialConnection',
    text: 'มีระบบสนับสนุนหรือผู้พึ่งพิงทางจิตใจ',
    description: 'เมื่อเจอปัญหารุมเร้า รู้สึกว่ามีคนที่ไว้ใจและพร้อมช่วยเหลือ สนับสนุน และรับฟังปัญหาโดยไม่ตัดสิน'
  },
  {
    id: 'soc3',
    pillar: 'socialConnection',
    text: 'การเข้าร่วมกลุ่ม/ชุมชนกิจกรรมดีงาม',
    description: 'มีกลุ่ม สมาคม ชมรม หรือมีส่วนร่วมในกิจกรรมทางสังคมเชิงบวกสร้างสรรค์'
  }
];

// Helper to determine basic program for a patient
export function getBasicProgramDetails(gender: 'female' | 'male', age: number) {
  if (age < 35) {
    if (gender === 'female') {
      return {
        name: 'โปรแกรมตรวจสุขภาพพื้นฐาน (เพศหญิง อายุ < 35 ปี)',
        price: 580,
        tests: ['physical', 'chestXray', 'cbc', 'ua', 'stoolExam', 'stoolOccult', 'papSmear']
      };
    } else {
      return {
        name: 'โปรแกรมตรวจสุขภาพพื้นฐาน (เพศชาย อายุ < 35 ปี)',
        price: 380,
        tests: ['physical', 'chestXray', 'cbc', 'ua', 'stoolExam', 'stoolOccult']
      };
    }
  } else {
    const allOver35Tests = [
      'physical', 'chestXray', 'cbc', 'ua', 'stoolExam', 'stoolOccult',
      'fbs', 'creatinine', 'bun', 'uricAcid', 'sgot', 'sgpt', 'alk', 'cholesterol', 'triglyceride'
    ];
    if (gender === 'female') {
      return {
        name: 'โปรแกรมตรวจสุขภาพพื้นฐาน (เพศหญิง อายุ >= 35 ปี)',
        price: 1050,
        tests: [...allOver35Tests, 'papSmear']
      };
    } else {
      return {
        name: 'โปรแกรมตรวจสุขภาพพื้นฐาน (เพศชาย อายุ >= 35 ปี)',
        price: 850,
        tests: allOver35Tests
      };
    }
  }
}

// Initial mockup data
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    hn: '8241',
    name: 'นายสมชาย ใจดี',
    phone: '0812345678',
    gender: 'male',
    age: 42,
    birthDate: '1984-05-12',
    password: 'SOMC1234',
    registeredAt: '2026-05-12'
  },
  {
    id: 'p2',
    hn: '8242',
    name: 'นางสาวสมศรี รักดี',
    phone: '0898765432',
    gender: 'female',
    age: 31,
    birthDate: '1995-06-20',
    password: 'SOMS5678',
    registeredAt: '2026-06-20'
  },
  {
    id: 'p3',
    hn: '8243',
    name: 'นายวิชัย เรียนดี',
    phone: '0854443322',
    gender: 'male',
    age: 28,
    birthDate: '1998-07-01',
    password: 'WICH1111',
    registeredAt: '2026-07-01'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'ap1',
    patientId: 'p1',
    date: '2026-07-15',
    time: '08:30 - 09:00',
    basicProgramName: 'โปรแกรมตรวจสุขภาพพื้นฐาน (เพศชาย อายุ >= 35 ปี)',
    basicProgramPrice: 850,
    selectedBasicTests: ['physical', 'chestXray', 'cbc', 'ua', 'stoolExam', 'stoolOccult', 'fbs', 'creatinine', 'bun', 'uricAcid', 'sgot', 'sgpt', 'alk', 'cholesterol', 'triglyceride'],
    specialTests: ['ekg', 'hba1c'],
    totalCost: 1200,
    status: 'pending',
    patientType: 'walk-in',
    medicalCoverage: 'ชำระเงินเอง'
  },
  {
    id: 'ap2',
    patientId: 'p2',
    date: '2026-07-05',
    time: '09:00 - 09:30',
    basicProgramName: 'โปรแกรมตรวจสุขภาพพื้นฐาน (เพศหญิง อายุ < 35 ปี)',
    basicProgramPrice: 580,
    selectedBasicTests: ['physical', 'chestXray', 'cbc', 'ua', 'stoolExam', 'stoolOccult', 'papSmear'],
    specialTests: ['hdl', 'ldl'],
    totalCost: 830,
    status: 'completed',
    patientType: 'walk-in',
    medicalCoverage: 'สิทธิประกันสังคม'
  },
  {
    id: 'ap3',
    patientId: 'p3',
    date: '2026-07-08',
    time: '08:00 - 08:30',
    basicProgramName: 'โปรแกรมตรวจสุขภาพพื้นฐาน (เพศชาย อายุ < 35 ปี)',
    basicProgramPrice: 380,
    selectedBasicTests: ['physical', 'chestXray', 'cbc', 'ua', 'stoolExam', 'stoolOccult'],
    specialTests: ['uricAcid', 'fbs'],
    totalCost: 480,
    status: 'completed',
    patientType: 'walk-in',
    medicalCoverage: 'สิทธิบัตรทอง (30 บาท)'
  }
];

export const INITIAL_ASSESSMENTS: LM6Assessment[] = [
  {
    id: 'as1',
    patientId: 'p1',
    date: '2026-07-09',
    scores: {
      nutrition: 10,
      physicalActivity: 8,
      stressManagement: 7,
      avoidSubstances: 15,
      restorativeSleep: 9,
      socialConnection: 12
    },
    answers: {
      nut1: 4, nut2: 3, nut3: 3,
      phy1: 3, phy2: 3, phy3: 2,
      str1: 2, str2: 3, str3: 2,
      sub1: 5, sub2: 5, sub3: 5,
      sle1: 3, sle2: 3, sle3: 3,
      soc1: 4, soc2: 4, soc3: 4
    },
    recommendations: [
      'โภชนาการ: ควรดื่มน้ำเพิ่มขึ้น และทานผักผลไม้เพิ่มในชีวิตประจำวัน',
      'กิจกรรมทางกาย: ระดับการเคลื่อนไหวยังต่ำ ควรเริ่มออกกำลังกายอย่างน้อย 150 นาทีต่อสัปดาห์',
      'การจัดการความเครียด: ความเครียดค่อนข้างสูงและขาดวิธีผ่อนคลาย ควรจัดเวลาฝึกหายใจ 5 นาทีระหว่างวัน'
    ]
  },
  {
    id: 'as2',
    patientId: 'p2',
    date: '2026-07-05',
    scores: {
      nutrition: 14,
      physicalActivity: 13,
      stressManagement: 12,
      avoidSubstances: 15,
      restorativeSleep: 13,
      socialConnection: 14
    },
    answers: {
      nut1: 5, nut2: 4, nut3: 5,
      phy1: 4, phy2: 4, phy3: 5,
      str1: 4, str2: 4, str3: 4,
      sub1: 5, sub2: 5, sub3: 5,
      sle1: 4, sle2: 4, sle3: 5,
      soc1: 5, soc2: 4, soc3: 5
    },
    recommendations: [
      'พฤติกรรมสุขภาพดีเยี่ยมในทุกด้าน: ขอให้รักษามาตรฐานสุขนิสัยที่ดีเช่นนี้ต่อไป เพื่อป้องกันโรคเรื้อรังในระยะยาว'
    ]
  },
  {
    id: 'as3',
    patientId: 'p3',
    date: '2026-07-08',
    scores: {
      nutrition: 7,
      physicalActivity: 9,
      stressManagement: 8,
      avoidSubstances: 11,
      restorativeSleep: 8,
      socialConnection: 10
    },
    answers: {
      nut1: 2, nut2: 2, nut3: 3,
      phy1: 3, phy2: 3, phy3: 3,
      str1: 3, str2: 3, str3: 2,
      sub1: 5, sub2: 3, sub3: 3,
      sle1: 3, sle2: 2, sle3: 3,
      soc1: 3, soc2: 4, soc3: 3
    },
    recommendations: [
      'โภชนาการ: ควรปรับปรุงโดยด่วน ทานผักผลไม้น้อยและทานอาหารรสจัด/แปรรูปบ่อยครั้ง เสี่ยงต่อกรดยูริกสูง',
      'สารอันตราย: มีการดื่มแอลกอฮอล์บ่อยครั้ง แนะนำให้งดหรือจำกัดปริมาณแอลกอฮอล์เพื่อปกป้องตับและลดระดับกรดยูริก',
      'การนอนหลับ: นอนไม่เป็นเวลาและมักเล่นมือถือก่อนนอน ส่งผลต่อคุณภาพการหลับ'
    ]
  }
];

export const INITIAL_RESULTS: LabResult[] = [
  {
    id: 'res2',
    patientId: 'p2',
    appointmentId: 'ap2',
    examDate: '2026-07-05',
    doctorName: 'พญ. พรประภา แสงธรรม',
    status: 'completed',
    physical: {
      weight: 52,
      height: 160,
      bloodPressure: '115/75',
      heartRate: 72,
      bmi: 20.3,
      bmiStatus: 'น้ำหนักปกติ',
      generalStatus: 'ปกติ',
      notes: 'สภาพร่างกายทั่วไปแข็งแรงสมบูรณ์ดี สัญญาณชีพปกติ'
    },
    chestXray: {
      status: 'ปกติ',
      description: 'CXR: No active lung lesion. Normal heart size. Both costophrenic angles are clear.'
    },
    parameters: {
      cbc: { value: 'ปกติ (WBC 6,200, Hb 12.8, Plt 280k)', status: 'ปกติ' },
      ua: { value: 'ปกติ (Protein Neg, Glucose Neg)', status: 'ปกติ' },
      stoolExam: { value: 'ไม่พบไข่พยาธิ', status: 'ปกติ' },
      stoolOccult: { value: 'Negative', status: 'ปกติ' },
      papSmear: { value: 'Negative for Malignancy', status: 'ปกติ' },
      hdl: { value: '55', status: 'ปกติ' },
      ldl: { value: '110', status: 'ปกติ' }
    },
    attachedFiles: [
      {
        id: 'f1',
        category: 'Chest X-Ray',
        name: 'chest_xray_p2.pdf',
        size: '1.2 MB',
        type: 'application/pdf',
        url: '#',
        uploadedAt: '2026-07-05 10:45'
      }
    ],
    summary: 'ผลการตรวจสุขภาพโดยทั่วไปอยู่ในเกณฑ์ปกติ สมบูรณ์ดี ผลเอกซเรย์ปอดปกติ และตรวจมะเร็งปากมดลูกปกติ',
    recommendations: [
      'ตรวจมะเร็งปากมดลูก (Pap smear) ควรตรวจซ้ำเป็นประจำทุก 2-3 ปี',
      'ดูแลรับประทานอาหารที่มีกากใยเพื่อส่งเสริมสุขภาพลำไส้ต่อเนื่อง',
      'รักษาน้ำหนักให้อยู่ในเกณฑ์มาตรฐานด้วยการทานอาหารที่มีประโยชน์และขยับตัวต่อเนื่อง'
    ]
  },
  {
    id: 'res3',
    patientId: 'p3',
    appointmentId: 'ap3',
    examDate: '2026-07-08',
    doctorName: 'นพ. เกรียงไกร สุขวิเศษ',
    status: 'completed',
    physical: {
      weight: 78,
      height: 172,
      bloodPressure: '135/85',
      heartRate: 80,
      bmi: 26.4,
      bmiStatus: 'น้ำหนักเกิน (Overweight)',
      generalStatus: 'เสี่ยงสูง',
      notes: 'น้ำหนักเกินเกณฑ์ ความดันโลหิตค่อนข้างสูงเล็กน้อย (Pre-hypertension) ควรสังเกตอาการ'
    },
    chestXray: {
      status: 'ปกติ',
      description: 'CXR: Lungs are clear. Normal heart shadow.'
    },
    parameters: {
      cbc: { value: 'ปกติ (WBC 7,800, Hb 14.5, Plt 310k)', status: 'ปกติ' },
      ua: { value: 'ปกติ', status: 'ปกติ' },
      stoolExam: { value: 'ไม่พบไข่พยาธิ', status: 'ปกติ' },
      stoolOccult: { value: 'Negative', status: 'ปกติ' },
      uricAcid: { value: '8.2 (สูงกว่าค่าอ้างอิงปกติ)', status: 'ผิดปกติ' },
      fbs: { value: '104 (ระดับน้ำตาลเริ่มสูงกว่าปกติ)', status: 'เสี่ยงสูง' }
    },
    attachedFiles: [
      {
        id: 'f2',
        category: 'Uric Acid & Fasting Sugar',
        name: 'blood_chemistry_p3.pdf',
        size: '850 KB',
        type: 'application/pdf',
        url: '#',
        uploadedAt: '2026-07-08 11:20'
      }
    ],
    summary: 'พบภาวะน้ำหนักเกิน ร่วมกับกรดยูริกสูง (8.2 mg/dL) และระดับน้ำตาลในเลือดหลังงดอาหารเริ่มสูงเล็กน้อย (104 mg/dL - ภาวะก่อนเบาหวาน)',
    recommendations: [
      'กรดยูริกสูง: แนะนำให้งดการทานเครื่องในสัตว์ สัตว์ปีกยอดผัก ยอดหน่อไม้ แอลกอฮอล์ และดื่มน้ำมากๆ',
      'ระดับน้ำตาลเสี่ยงเบาหวาน: ลดอาหารประเภทคาร์โบไฮเดรตแปรรูป แป้งขัดสี ขนมหวาน และออกกำลังกายสม่ำเสมอ',
      'ควบคุมน้ำหนักตัว: พยายามลดปริมาณพลังงานรวมต่อวันและเพิ่มการออกกำลังกายประเภทแอโรบิกอย่างน้อย 30 นาทีต่อวัน'
    ]
  }
];
