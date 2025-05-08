"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { UserCircle, Settings, Bell, CalendarCheck } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [topRecommendation, setTopRecommendation] = useState<string | null>(null);
  const [totalAnalyses, setTotalAnalyses] = useState<number>(0);
  const [userName, setUserName] = useState<string | null>(user?.name || null);

  // Helper to compute health score from results
  const getHealthScore = (scan: any) => {
    if (!scan?.results) return null;
    const scores = Object.values(scan.results)
      .map((r: any) => r && typeof r.score === 'number' ? r.score : null)
      .filter((v) => v !== null);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  };

  const latestScan = recentScans[0];
  const healthScore = getHealthScore(latestScan);
  const lastUpdated = latestScan ? new Date(latestScan.createdAt) : null;

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        // Get JWT from localStorage (adjust if you use cookies)
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/v1/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUserName(data.name || null);
      } catch {
        setUserName(null);
      }
    };
    if (!user?.name) {
      fetchUserName();
    }
  }, [user]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    // Set current date
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    setCurrentDate(date.toLocaleDateString('en-US', options));
  }, []);

  useEffect(() => {
    // Fetch recent scans and total analyses from API
    const fetchRecentScans = async () => {
      setLoadingScans(true);
      try {
        const res = await fetch("/api/website-analysis/history");
        const data = await res.json();
        setRecentScans(data.analyses ? data.analyses.slice(0, 5) : []);
        setTotalAnalyses(data.analyses ? data.analyses.length : 0);
      } catch (e) {
        setRecentScans([]);
        setTotalAnalyses(0);
      } finally {
        setLoadingScans(false);
      }
    };
    fetchRecentScans();
  }, []);

  // Compute dynamic top recommendation from latest scan
  useEffect(() => {
    if (!latestScan || !latestScan.results) {
      setTopRecommendation(null);
      return;
    }
    if (latestScan.results.seo && latestScan.results.seo.score < 90) {
      setTopRecommendation("Improve meta descriptions for SEO.");
    } else if (latestScan.results.performance && latestScan.results.performance.score < 90) {
      setTopRecommendation("Optimize images and scripts for better performance.");
    } else if (latestScan.results.security && latestScan.results.security.score < 90) {
      setTopRecommendation("Review your website's security settings.");
    } else if (latestScan.results.accessibility && latestScan.results.accessibility.score < 90) {
      setTopRecommendation("Address accessibility issues for a better user experience.");
    } else {
      setTopRecommendation("No major issues detected. Keep up the good work!");
    }
  }, [latestScan]);

  return (
    <DashboardLayout>
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 py-10 px-4 md:px-6 auto-rows-[minmax(120px,auto)]">
        {/* Row 1: Greeting */}
        <div className="col-span-1 md:col-span-4 rounded-3xl bg-gradient-to-r from-blue-800/60 to-purple-900/40 p-8 shadow-lg flex flex-col items-center border border-blue-900/30 mb-2">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="w-10 h-10 text-blue-300" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              {greeting}{userName ? `, ${userName}` : ""}
            </h1>
          </div>
          <p className="text-base md:text-lg text-blue-200 font-medium mb-1">{currentDate}</p>
        </div>

        {/* Row 2: 3 Stats + Settings */}
        <div className="md:col-span-1 flex flex-col items-center bg-white/5 rounded-xl p-6 min-w-[100px] border border-white/10 h-full justify-center">
          <span className="text-3xl font-extrabold text-blue-400 mb-2">{totalAnalyses}</span>
          <span className="text-base font-semibold text-gray-300">Total Scans</span>
        </div>
        <div className="md:col-span-1 flex flex-col items-center bg-white/5 rounded-xl p-6 min-w-[100px] border border-white/10 h-full justify-center">
          <span className="text-3xl font-extrabold text-green-400 mb-2">{recentScans.length > 0 ? `${Math.round(recentScans.reduce((a, b) => {
            const score = getHealthScore(b);
            return a + (score !== null ? score : 0);
          }, 0) / recentScans.length)}%` : "--"}</span>
          <span className="text-base font-semibold text-gray-300">Average Score</span>
        </div>
        <div className="md:col-span-1 flex flex-col items-center bg-white/5 rounded-xl p-6 min-w-[100px] border border-white/10 h-full justify-center">
          <span className="text-3xl font-extrabold text-red-400 mb-2">{recentScans.reduce((a, b) => {
            const score = getHealthScore(b);
            return a + (score !== null && score < 90 ? 1 : 0);
          }, 0)}</span>
          <span className="text-base font-semibold text-gray-300">Issues Found</span>
        </div>
        <div className="md:col-span-1 flex flex-col justify-center items-start gap-4 bg-white/5 rounded-2xl p-6 border border-white/10 shadow h-full">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <span className="text-base font-semibold text-blue-300">Scan Frequency:</span>
            <span className="text-base text-blue-200">Daily</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-purple-400" />
            <span className="text-base font-semibold text-purple-300">Notifications:</span>
            <span className="text-base text-purple-200">On</span>
          </div>
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-5 h-5 text-teal-400" />
            <span className="text-base font-semibold text-teal-300">Report Schedule:</span>
            <span className="text-base text-teal-200">Weekly</span>
          </div>
        </div>

        {/* Row 3: Top Recommendation + Quick Actions */}
        <div className="md:col-span-2 flex flex-col items-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-white/10 h-full justify-center shadow">
          <div className="flex items-center gap-3 mb-3">
            <Bell className="w-7 h-7 text-yellow-300" />
            <span className="text-2xl font-bold text-white">Top Recommendation</span>
          </div>
          <div className="text-lg text-gray-200 text-center font-medium">
            {topRecommendation || "No recommendations available."}
          </div>
        </div>
        <div className="md:col-span-2 flex flex-col justify-center items-center bg-white/5 rounded-2xl p-8 border border-white/10 shadow h-full">
          <div className="flex flex-row justify-center gap-4 w-full">
            <Link href="/analysis/new">
              <button className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow border border-white/10 transition-all" aria-label="New Analysis">New Analysis</button>
            </Link>
            <Link href="/reports">
              <button className="px-5 py-3 bg-blue-900/40 hover:bg-blue-900/60 text-white rounded-xl font-semibold shadow border border-white/10 transition-all" aria-label="Generate Report">Generate Report</button>
            </Link>
            <Link href="/history">
              <button className="px-5 py-3 bg-blue-900/40 hover:bg-blue-900/60 text-white rounded-xl font-semibold shadow border border-white/10 transition-all" aria-label="View History">View History</button>
            </Link>
          </div>
        </div>

        {/* Row 4: Website Health + Recent Scans */}
        <div className="md:col-span-2 row-span-2 rounded-3xl p-8 shadow-lg flex flex-col items-center justify-center h-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-6xl font-extrabold text-green-400">{healthScore !== null ? `${healthScore}%` : "--%"}</span>
            <span className="text-3xl">{healthScore !== null ? (healthScore >= 90 ? "✅" : healthScore >= 70 ? "⚠️" : "❌") : "❌"}</span>
          </div>
          <div className="text-xl font-semibold text-white mb-1">Website Health</div>
          <div className="text-gray-300 text-center">
            {healthScore !== null ? (
              healthScore >= 90 ? "No critical issues detected."
              : healthScore >= 70 ? "Some issues need your attention."
              : "Critical issues detected!"
            ) : "No recent scan data."}
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-400 mt-2">Last updated: {lastUpdated.toLocaleString()}</div>
          )}
        </div>
        <div className="md:col-span-2 row-span-2 rounded-2xl bg-white/5 p-5 shadow flex flex-col gap-4 h-full border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-white">Recent Scans</span>
          </div>
          <ul className="divide-y divide-white/10">
            {loadingScans ? (
              <li className="py-3 text-center text-gray-400">Loading recent scans...</li>
            ) : recentScans.length === 0 ? (
              <li className="py-3 text-center text-gray-400">No recent scans found.</li>
            ) : (
              recentScans.map((scan) => (
                <li key={scan.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${scan.healthScore >= 90 ? "bg-green-400" : scan.healthScore >= 70 ? "bg-yellow-400" : "bg-red-400"}`}></span>
                    <span className="text-white font-medium">{scan.url}</span>
                    {scan.results?.accessibility?.score === 100 && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-green-700 text-xs text-white flex items-center gap-1" title="Perfect Accessibility">
                        <span role="img" aria-label="Accessibility">♿</span> 100
                      </span>
                    )}
                    {scan.results?.security?.score === 100 && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-blue-700 text-xs text-white flex items-center gap-1" title="Perfect Security">
                        <span role="img" aria-label="Security">🔒</span> 100
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{new Date(scan.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`text-sm font-bold ${scan.healthScore >= 90 ? "text-green-400" : scan.healthScore >= 70 ? "text-yellow-400" : "text-red-400"}`}>{scan.healthScore}%</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}