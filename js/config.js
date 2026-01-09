/**
 * Configuration and Constants
 */

// Quiz data files
export const QUIZ_DATA_FILES = [
  { name: "Chương 1-2", file: "chuong1-2.json" },
  { name: "Chương 3-4", file: "chuong3-4.json" },
  { name: "Chương 5-6", file: "chuong5-6.json" },
  { name: "Chương 7-8", file: "chuong7-8.json" },
  { name: "Bonus 1", file: "bonus1.json" },
  { name: "Bonus 2", file: "bonus2.json" },
  { name: "Bonus 3", file: "bonus3.json" },
  { name: "Bonus 4", file: "bonus4.json" },
  { name: "Bonus 5", file: "bonus5.json" },
  { name: "Bonus 6", file: "bonus6.json" },
  { name: "OnTap1", file: "ontap1.json" },
  { name: "OnTap2", file: "ontap2.json" },
  { name: "OnTap3", file: "ontap3.json" },
  { name: "OnTap4", file: "ontap4.json" },
  {
    name: "📝 Điền chỗ trống - Tổng hợp",
    file: "fill-in-blank-questions.json",
  },
  { name: "📝 Điền chỗ trống - C3-4", file: "fill-in-blank-chuong3-4.json" },
  { name: "📝 Điền chỗ trống - C5-6", file: "fill-in-blank-chuong5-6.json" },
  { name: "📝 Điền chỗ trống - C7-8", file: "fill-in-blank-chuong7-8.json" },
  { name: "📝 Điền chỗ trống - Nâng cao", file: "fill-in-blank-advanced.json" },
  { name: "🔥 Firewall & UTM", file: "fill-in-blank-firewall.json" },
  { name: "📧 Email Security", file: "fill-in-blank-email.json" },
  { name: "🦠 Malware & Virus", file: "fill-in-blank-malware.json" },
];

// Application state
export const state = {
  app: null,
  currentQuizQuestions: [],
  userAnswers: {},
  currentQuizFile: null,
  questionStats: { correct: 0, incorrect: 0, total: 0 },
  flaggedQuestions: {},
};
