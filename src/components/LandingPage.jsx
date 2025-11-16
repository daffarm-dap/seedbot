import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Cpu,
  MapPin,
  Brain,
  Newspaper,
  ChevronRight,
  Target,
  Database,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

import logoIcon from "figma:asset/88069b1892f4c1c70d51f47030a7591b1dea6dba.png";
import logoMedium from "figma:asset/6931a194092f1fc319eb76cb6dbe2b371fb5d49e.png";
import logoFull from "figma:asset/fa064eadb0b7358db78b51b72f72da7abf0af281.png";

import api from "../services/api";

export function LandingPage({
  onNavigateToLogin,
  onNavigateToNews,
}) {
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await api.news.getAll();
      const newsData = response.news || response || [];

      const publishedNews = newsData
        .filter((article) => article.status === "Published")
        .slice(0, 3);

      setLatestNews(publishedNews);
    } catch (error) {
      console.error("Gagal memuat berita:", error);
      // Don't show error toast on landing page, just log it
    } finally {
      setLoading(false);
    }
  };

  // Load news on mount
  useEffect(() => {
    loadNews();
  }, []);

  // Auto-refresh news every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadNews();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh news when window becomes visible/focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadNews();
      }
    };

    const handleFocus = () => {
      loadNews();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      {/* HEADER */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logoFull}
              alt="Seedbot Logo"
              className="hidden lg:block h-16 w-auto"
            />
            <img
              src={logoMedium}
              alt="Seedbot"
              className="hidden md:block lg:hidden h-12 w-auto"
            />
            <img src={logoIcon} alt="Seedbot" className="md:hidden h-12 w-auto" />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-slate-600 hover:text-emerald-600">
              Beranda
            </a>
            <a href="#tech" className="text-slate-600 hover:text-emerald-600">
              Teknologi
            </a>

            <button
              onClick={onNavigateToNews}
              className="text-slate-600 hover:text-emerald-600"
            >
              Berita
            </button>

            <Button
              onClick={onNavigateToLogin}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
            >
              Login
            </Button>
          </nav>

          <Button
            onClick={onNavigateToLogin}
            className="md:hidden bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            Login
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-slate-800 leading-tight">
                Sistem Penabur Benih Jagung Otomatis
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full" />

              <p className="text-lg text-slate-600 leading-relaxed">
                Melalui <span className="font-semibold text-emerald-600">SeedBot</span>, kami
                menghadirkan sistem tanam otomatis berbasis AI dan GPS presisi untuk
                pertanian modern.
              </p>

              <div className="flex gap-4 flex-wrap">
                <Button
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById("tech")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl group"
                >
                  Teknologi Kami
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Button>

                <Button
                  size="lg"
                  onClick={onNavigateToLogin}
                  variant="outline"
                  className="border-2 border-emerald-600 text-emerald-700 group"
                >
                  Login
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl rotate-3" />

              <ImageWithFallback
                src="https://images.unsplash.com/photo-1609130855718-882c8515f8e7"
                alt="Corn Field"
                className="relative rounded-2xl shadow-2xl w-full h-[500px] object-cover -rotate-3 hover:rotate-0 transition"
              />

              {/* Floating badges */}
              <div className="absolute top-6 -left-4 bg-white rounded-xl shadow-xl p-4 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Presisi GPS</div>
                    <div className="text-sm text-slate-800">±2cm Akurat</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-6 -right-4 bg-white rounded-xl shadow-xl p-4 animate-bounce"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">AI Analysis</div>
                    <div className="text-sm text-slate-800">Real-time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH SECTION */}
      <section id="tech" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700">
              <Cpu className="w-3 h-3 mr-1" />
              Teknologi Kami
            </Badge>

            <h2 className="text-slate-800 mb-4">Inovasi yang Mengubah Pertanian</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Kombinasi robotik, GPS presisi, dan kecerdasan buatan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* CARD 1 */}
            <Card className="border-2 hover:border-emerald-300 hover:shadow-xl transition">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-slate-800">GPS Precision</CardTitle>
              </CardHeader>
              <CardContent>
                Sistem GPS RTK memastikan posisi tanam super akurat.
              </CardContent>
            </Card>

            {/* CARD 2 */}
            <Card className="border-2 hover:border-emerald-300 hover:shadow-xl transition">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-slate-800">Machine Learning</CardTitle>
              </CardHeader>
              <CardContent>
                AI menganalisis tanah dan kondisi lahan secara real-time.
              </CardContent>
            </Card>

            {/* CARD 3 */}
            <Card className="border-2 hover:border-emerald-300 hover:shadow-xl transition">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-slate-800">Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                Dashboard memantau setiap proses secara langsung.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section id="news" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-100 text-teal-700">
              <Newspaper className="w-3 h-3 mr-1" />
              Update Terbaru
            </Badge>

            <h2 className="text-slate-800 mb-4">Berita & Artikel</h2>
            <p className="text-slate-600">
              Informasi terkini seputar inovasi pertanian otomatis.
            </p>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 py-8">
              Memuat berita...
            </div>
          ) : latestNews.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              Belum ada berita tersedia
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {latestNews.map((article, index) => (
                <Card
                  key={article.id}
                  className="overflow-hidden hover:shadow-xl transition"
                >
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-48 object-cover hover:scale-110 transition duration-500"
                    />

                    <div className="absolute top-4 left-4">
                      <Badge
                        className={
                          index === 0
                            ? "bg-emerald-600 text-white"
                            : index === 1
                              ? "bg-teal-600 text-white"
                              : "bg-cyan-600 text-white"
                        }
                      >
                        {index === 0
                          ? "Teknologi"
                          : index === 1
                            ? "Studi Kasus"
                            : "Update"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-slate-800 line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {article.content}
                    </p>

                    <div className="text-sm text-slate-500">
                      {new Date(article.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={onNavigateToNews}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 shadow-xl"
            >
              Lihat Semua Berita
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-br from-slate-800 via-emerald-950 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img src={logoFull} alt="SeedBot" className="h-16 w-auto mb-6" />

              <p className="text-slate-400 mb-4">
                Sistem penabur benih jagung otomatis berbasis AI dan GPS untuk pertanian modern.
              </p>

              <div className="flex gap-2">
                <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="text-teal-400 border-teal-400">
                  GPS Precision
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-slate-200">Kontak</h3>
              <p className="text-slate-400 text-sm mb-2">Email: info@seedbot.id</p>
              <p className="text-slate-400 text-sm mb-2">Telepon: (021) 8765-4321</p>
              <p className="text-slate-400 text-sm">WhatsApp: +62 812-3456-7890</p>
            </div>

            <div>
              <h3 className="mb-4 text-slate-200">Ikuti Kami</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p className="hover:text-emerald-400 cursor-pointer">Instagram</p>
                <p className="hover:text-emerald-400 cursor-pointer">Facebook</p>
                <p className="hover:text-emerald-400 cursor-pointer">YouTube</p>
                <p className="hover:text-emerald-400 cursor-pointer">LinkedIn</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 SeedBot Indonesia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}