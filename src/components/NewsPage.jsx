import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ArrowLeft, Calendar, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoIcon from "figma:asset/88069b1892f4c1c70d51f47030a7591b1dea6dba.png";
import logoMedium from "figma:asset/6931a194092f1fc319eb76cb6dbe2b371fb5d49e.png";
import logoFull from "figma:asset/fa064eadb0b7358db78b51b72f72da7abf0af281.png";
import api from "../services/api";

export function NewsPage({ onNavigateBack }) {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await api.news.getAll();
      const newsData = response.news || response || [];

      const publishedNews = newsData.filter(
        (article) => article.status === "Published"
      );

      setNewsArticles(publishedNews);
    } catch (error) {
      console.error("Gagal memuat berita:", error);
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
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateBack}
                className="text-slate-600 hover:text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center">
                <img 
                  src={logoMedium} 
                  alt="Seedbot" 
                  className="hidden md:block h-12 w-auto"
                />
                <img 
                  src={logoIcon} 
                  alt="Seedbot" 
                  className="md:hidden h-12 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200">
              Berita & Artikel
            </Badge>
            <h1 className="text-slate-800 mb-4">
              Update Terbaru SeedBot
            </h1>
            <p className="text-lg text-slate-600">
              Informasi terkini seputar inovasi teknologi pertanian otomatis dan perkembangan smart farming di Indonesia
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center text-slate-500 py-8">
              Memuat berita...
            </div>
          ) : newsArticles.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              Belum ada berita tersedia
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.map((article, index) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={
                      index % 3 === 0 ? "bg-emerald-600 text-white" : 
                      index % 3 === 1 ? "bg-teal-600 text-white" : 
                      "bg-cyan-600 text-white"
                    }>
                      {index % 3 === 0 ? "Teknologi" : index % 3 === 1 ? "Studi Kasus" : "Update"}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 line-clamp-3">
                    {article.content}
                  </p>
                  <div className="flex items-center justify-between text-sm pt-4 border-t">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.date).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedArticle(article)}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 group-hover:translate-x-1 transition-transform"
                    >
                      Baca Selengkapnya →
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-6">
                <img 
                  src={logoFull} 
                  alt="Seedbot - Growing the Future with AI & IOT" 
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-slate-400 mb-4">
                Sistem penabur benih jagung otomatis berbasis AI dan GPS untuk pertanian presisi masa depan.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-emerald-400 border-emerald-400">AI-Powered</Badge>
                <Badge variant="outline" className="text-teal-400 border-teal-400">GPS Precision</Badge>
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
                <p className="hover:text-emerald-400 cursor-pointer transition-colors">Instagram</p>
                <p className="hover:text-emerald-400 cursor-pointer transition-colors">Facebook</p>
                <p className="hover:text-emerald-400 cursor-pointer transition-colors">YouTube</p>
                <p className="hover:text-emerald-400 cursor-pointer transition-colors">LinkedIn</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 SeedBot Indonesia. All rights reserved. Made with ❤️ for Indonesian Farmers.</p>
          </div>
        </div>
      </footer>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl mt-4">{selectedArticle?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedArticle?.imageUrl && (
              <div className="relative overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              {selectedArticle?.date && new Date(selectedArticle.date).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedArticle?.content}
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                onClick={() => setSelectedArticle(null)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
