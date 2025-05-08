"use client";

import { motion } from "framer-motion";
import { FiDownload, FiShare2, FiPrinter } from "react-icons/fi";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

interface Props {
  data: any; // Using any type since we'll need the complete analysis data
}

export default function ExportOptions({ data }: Props) {
  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();
      let lastY = 30;

      // Add title
      doc.setFontSize(20);
      doc.text("Website Analysis Report", 14, 20);
      lastY = 30;

      // Add URL
      doc.setFontSize(12);
      doc.text(`URL: ${data.url}`, 14, lastY);
      lastY += 10;

      // Performance Metrics
      doc.setFontSize(16);
      doc.text("Performance Metrics", 14, lastY + 10);
      autoTable(doc, {
        startY: lastY + 15,
        head: [["Metric", "Value"]],
        body: [
          ["Score", data.performance.score],
          ...Object.entries(data.performance.metrics || {}).map(([k, v]) => [
            k,
            v,
          ]),
        ],
      });
      lastY = doc.lastAutoTable.finalY || lastY + 30;

      // Security Analysis
      doc.setFontSize(16);
      doc.text("Security Analysis", 14, lastY + 10);
      autoTable(doc, {
        startY: lastY + 15,
        head: [["Score", "Vulnerabilities"]],
        body: [[data.security.score, data.security.issues?.length || 0]],
      });
      lastY = doc.lastAutoTable.finalY || lastY + 30;
      if (data.security.issues && data.security.issues.length > 0) {
        autoTable(doc, {
          startY: lastY + 5,
          head: [["Severity", "Description", "Recommendation"]],
          body: data.security.issues.map((issue: any) => [
            issue.severity,
            issue.description,
            issue.recommendation,
          ]),
        });
        lastY = doc.lastAutoTable.finalY || lastY + 30;
      }

      // Uptime
      doc.setFontSize(16);
      doc.text("Uptime", 14, lastY + 10);
      autoTable(doc, {
        startY: lastY + 15,
        head: [["Score", ...Object.keys(data.uptime.metrics || {})]],
        body: [
          [data.uptime.score, ...Object.values(data.uptime.metrics || {})],
        ],
      });
      lastY = doc.lastAutoTable.finalY || lastY + 30;

      // SEO Analysis
      doc.setFontSize(16);
      doc.text("SEO Analysis", 14, lastY + 10);
      autoTable(doc, {
        startY: lastY + 15,
        head: [["Issue", "Severity", "Description", "Recommendation"]],
        body: data.seo.issues.map((issue: any) => [
          issue.severity,
          issue.description,
          issue.recommendation,
        ]),
      });
      lastY = doc.lastAutoTable.finalY || lastY + 30;

      // Accessibility Report
      doc.setFontSize(16);
      doc.text("Accessibility Report", 14, lastY + 10);
      let accY = lastY + 15;
      if (data.accessibility.wcagCompliance) {
        doc.setFontSize(12);
        doc.text(
          `WCAG Level: ${
            data.accessibility.wcagCompliance.level || ""
          }, Compliance: ${
            data.accessibility.wcagCompliance.status || ""
          }, Percentage: ${
            data.accessibility.wcagCompliance.percentage || ""
          }%`,
          14,
          accY
        );
        accY += 7;
      }
      if (data.accessibility.issuesByPriority) {
        doc.setFontSize(12);
        doc.text(
          `Issues by Priority: High: ${
            data.accessibility.issuesByPriority.high || 0
          }, Medium: ${data.accessibility.issuesByPriority.medium || 0}, Low: ${
            data.accessibility.issuesByPriority.low || 0
          }`,
          14,
          accY
        );
        accY += 7;
      }
      autoTable(doc, {
        startY: accY + 6,
        head: [["Impact/Priority", "Description", "WCAG Guideline / Solution"]],
        body: (data.accessibility.issues || []).map((issue: any) => [
          issue.impact || issue.priority,
          issue.description,
          issue.wcagGuideline || issue.solution,
        ]),
      });
      lastY = doc.lastAutoTable.finalY || accY + 30;

      // AI Insights
      doc.setFontSize(16);
      doc.text("AI Insights", 14, lastY + 10);
      let aiY = lastY + 18;
      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.text("Summary:", 14, aiY);
      doc.setFont(undefined, "normal");
      doc.setFontSize(12);
      // Wrap summary text if it's long
      const summaryLines = doc.splitTextToSize(data.aiInsights.summary, 180);
      doc.text(summaryLines, 14, aiY + 7);
      aiY += 7 + summaryLines.length * 6;

      if (
        data.aiInsights.recommendations &&
        data.aiInsights.recommendations.length > 0
      ) {
        doc.setFont(undefined, "bold");
        doc.text("Recommendations:", 14, aiY + 8);
        doc.setFont(undefined, "normal");
        aiY += 14;
        autoTable(doc, {
          startY: aiY,
          head: [["Category", "Description", "Priority"]],
          body: data.aiInsights.recommendations.map((rec: any) => [
            rec.category,
            rec.description,
            rec.priority,
          ]),
        });
        aiY = doc.lastAutoTable.finalY || aiY + 30;
      }
      if (data.aiInsights.insights && data.aiInsights.insights.length > 0) {
        doc.setFont(undefined, "bold");
        doc.text("Insights:", 14, aiY + 8);
        doc.setFont(undefined, "normal");
        aiY += 14;
        autoTable(doc, {
          startY: aiY,
          head: [["Aspect", "Analysis", "Suggestions"]],
          body: data.aiInsights.insights.map((ins: any) => [
            ins.aspect,
            ins.analysis,
            (ins.suggestions || []).join("; "),
          ]),
        });
      }

      // Save the PDF
      doc.save("website-analysis-report.pdf");
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleExportCSV = async () => {
    try {
      // Prepare data for CSV
      const csvData = [
        // Performance Metrics
        ["Performance Metrics"],
        ["Metric", "Value"],
        ["Score", data.performance.score],
        ...Object.entries(data.performance.metrics || {}),
        [],

        // Security Analysis
        ["Security Analysis"],
        ["Score", "Vulnerabilities"],
        [data.security.score, data.security.issues?.length || 0],
        ["Severity", "Description", "Recommendation"],
        ...(data.security.issues || []).map((issue: any) => [
          issue.severity,
          issue.description,
          issue.recommendation,
        ]),
        [],

        // Uptime
        ["Uptime"],
        ["Score", ...Object.keys(data.uptime.metrics || {})],
        [data.uptime.score, ...Object.values(data.uptime.metrics || {})],
        [],

        // SEO Analysis
        ["SEO Analysis"],
        ["Severity", "Description", "Recommendation"],
        ...data.seo.issues.map((issue: any) => [
          issue.severity,
          issue.description,
          issue.recommendation,
        ]),
        [],

        // Accessibility Report
        ["Accessibility Report"],
        [
          "WCAG Level",
          data.accessibility.wcagCompliance?.level || "",
          "Compliance",
          data.accessibility.wcagCompliance?.status || "",
          "Percentage",
          data.accessibility.wcagCompliance?.percentage || "",
        ],
        [
          "Issues by Priority",
          `High: ${data.accessibility.issuesByPriority?.high || 0}, Medium: ${
            data.accessibility.issuesByPriority?.medium || 0
          }, Low: ${data.accessibility.issuesByPriority?.low || 0}`,
        ],
        ["Impact/Priority", "Description", "WCAG Guideline / Solution"],
        ...(data.accessibility.issues || []).map((issue: any) => [
          issue.impact || issue.priority,
          issue.description,
          issue.wcagGuideline || issue.solution,
        ]),
        [],

        // AI Insights
        ["AI Insights"],
        ["Score", data.aiInsights.score || 0],
        ["Summary", data.aiInsights.summary],
        ["Recommendations"],
        ...(data.aiInsights.recommendations || []).map((rec: any) => [
          rec.category,
          rec.description,
          rec.priority,
        ]),
        ["Insights"],
        ...(data.aiInsights.insights || []).map((ins: any) => [
          ins.aspect,
          ins.analysis,
          (ins.suggestions || []).join("; "),
        ]),
      ];

      // Convert to CSV
      const csv = Papa.unparse(csvData);

      // Create and download file
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "website-analysis-report.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handlePrint = () => {
    try {
      window.print();
      toast.success("Print dialog opened");
    } catch (error) {
      toast.error("Failed to open print dialog");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Website Analysis Results",
          text: `Check out the analysis results for ${data.url}`,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to share");
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex flex-wrap gap-4">
        {/* PDF Export */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 
                     text-blue-400 rounded-lg transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          <span>Export PDF</span>
        </motion.button>

        {/* CSV Export */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 
                     text-green-400 rounded-lg transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          <span>Export CSV</span>
        </motion.button>

        {/* Print */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 
                     text-purple-400 rounded-lg transition-colors"
        >
          <FiPrinter className="w-4 h-4" />
          <span>Print</span>
        </motion.button>

        {/* Share */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 
                     text-indigo-400 rounded-lg transition-colors"
        >
          <FiShare2 className="w-4 h-4" />
          <span>Share</span>
        </motion.button>
      </div>
    </div>
  );
}
