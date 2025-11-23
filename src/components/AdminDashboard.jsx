import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  LogOut,
  UserPlus,
  Pencil,
  Trash2,
  Settings,
  Menu,
  Plus,
  Upload,
  X,
  Loader2,
  Lock,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import logoMedium from "figma:asset/6931a194092f1fc319eb76cb6dbe2b371fb5d49e.png";
import logoIcon from "figma:asset/88069b1892f4c1c70d51f47030a7591b1dea6dba.png";
import api from "../services/api";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function AdminDashboard({ username, onLogout }) {
  // Map menu ID to user-friendly hash
  const menuToHash = {
    "parameter-default": "parameter-default",
    "kelola-petani": "manajemen-user",
    "berita": "berita",
    "ganti-password": "ganti-password",
  };

  // Map hash to menu ID
  const hashToMenu = {
    "parameter-default": "parameter-default",
    "manajemen-user": "kelola-petani",
    "kelola-petani": "kelola-petani", // Support both formats
    "berita": "berita",
    "ganti-password": "ganti-password",
  };

  // Initialize activeMenu from URL hash or default to "parameter-default"
  const getInitialMenu = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      // Ignore #home and #admin - these are for page routing, not menu routing
      if (hash === 'home' || hash === 'admin') {
        return "parameter-default";
      }
      // Map hash to menu ID
      const menuId = hashToMenu[hash];
      if (menuId) {
        return menuId;
      }
    }
    return "parameter-default";
  };

  const [activeMenu, setActiveMenu] = useState(getInitialMenu());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get full name based on username
  const adminName = username || "Admin";
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    role: "petani",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteNewsDialogOpen, setIsDeleteNewsDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  // News Management State
  const [newsArticles, setNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    imageUrl: "",
    imageFile: null,
    status: "Draft",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAddNewsDialogOpen, setIsAddNewsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isEditNewsDialogOpen, setIsEditNewsDialogOpen] = useState(false);

  // Parameter State - HANYA Kedalaman Tanam dan Jarak Antar Benih
  const [defaultDepth, setDefaultDepth] = useState([5]);
  const [defaultSpacing, setDefaultSpacing] = useState([20]);
  const [loadingParameters, setLoadingParameters] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Helper function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const menuItems = [
    { id: "parameter-default", label: "Atur Parameter Default", icon: Settings },
    { id: "kelola-petani", label: "Manajemen User Petani", icon: Users },
    { id: "berita", label: "Manajemen Berita", icon: Newspaper },
    { id: "ganti-password", label: "Ganti Password", icon: Lock },
  ];

  // Load users from backend
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.admin.getUsers();
      // Convert backend format (fullName) to frontend format (name)
      const formattedUsers = response.users.map(user => ({
        id: user.id,
        name: user.fullName,
        username: user.username,
        role: user.role,
        status: user.status,
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Gagal memuat users:", error);
      toast.error("Gagal memuat daftar petani: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load users when menu changes to "kelola-petani"
  useEffect(() => {
    if (activeMenu === "kelola-petani") {
      loadUsers();
    }
  }, [activeMenu]);

  // Load news from backend
  const loadNews = async () => {
    try {
      setLoadingNews(true);
      // Get all news (no status filter for admin)
      const response = await api.news.getAll();
      // Backend returns {news: [...]}
      const newsData = response.news || response || [];
      setNewsArticles(Array.isArray(newsData) ? newsData : []);
    } catch (error) {
      console.error("Gagal memuat news:", error);
      
      // More detailed error message
      let errorMessage = "Terjadi kesalahan";
      if (error.message) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan di http://localhost:5000";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error("Gagal memuat daftar berita: " + errorMessage);
      setNewsArticles([]);
    } finally {
      setLoadingNews(false);
    }
  };

  // Load news when menu changes to "berita"
  useEffect(() => {
    if (activeMenu === "berita") {
      loadNews();
    }
  }, [activeMenu]);

  // Load parameters when menu changes to "parameter-default"
  useEffect(() => {
    const loadParameters = async () => {
      try {
        setLoadingParameters(true);
        const response = await api.admin.getParameters();
        
        // Backend returns {defaultDepth: number, defaultSpacing: number}
        if (response.defaultDepth !== undefined) {
          setDefaultDepth([response.defaultDepth]);
        }
        if (response.defaultSpacing !== undefined) {
          setDefaultSpacing([response.defaultSpacing]);
        }
      } catch (error) {
        console.error("Gagal memuat parameters:", error);
        toast.error("Gagal memuat parameter default: " + (error.message || "Terjadi kesalahan"));
      } finally {
        setLoadingParameters(false);
      }
    };

    if (activeMenu === "parameter-default") {
      loadParameters();
    }
  }, [activeMenu]);

  // Update URL hash when activeMenu changes or on mount
  useEffect(() => {
    const hash = menuToHash[activeMenu] || activeMenu;
    const currentHash = window.location.hash.replace('#', '');
    
    // Always update hash if it's #home or #admin (these are page-level hashes, not menu hashes)
    if (currentHash === 'home' || currentHash === 'admin') {
      window.location.hash = `#${hash}`;
    } else if (currentHash !== hash) {
      // Update hash if it doesn't match current menu
      window.location.hash = `#${hash}`;
    }
  }, [activeMenu]);

  // Listen for hash changes (e.g., browser back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      // Ignore #home and #admin - these are for page routing, not menu routing
      // If hash is #home or #admin, keep current menu or set to default
      if (hash === 'home' || hash === 'admin') {
        // Don't change menu, just update hash to current menu
        setActiveMenu(prevMenu => {
          const currentHash = menuToHash[prevMenu] || prevMenu;
          window.location.hash = `#${currentHash}`;
          return prevMenu;
        });
        return;
      }
      
      // Map hash to menu ID
      const menuId = hashToMenu[hash];
      if (menuId) {
        setActiveMenu(menuId);
      } else {
        // If hash doesn't match any menu, set to default and update hash
        setActiveMenu("parameter-default");
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Reset password form when leaving ganti-password menu
  useEffect(() => {
    if (activeMenu !== "ganti-password") {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
    }
  }, [activeMenu]);

  // Handle change password
  const handleChangePassword = async () => {
    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field harus diisi!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru harus minimal 6 karakter!");
      return;
    }

    try {
      setChangingPassword(true);
      
      await api.admin.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      
      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast.success("Password berhasil diubah!");
    } catch (error) {
      console.error("Gagal mengubah password:", error);
      toast.error("Gagal mengubah password: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setChangingPassword(false);
    }
  };

  // User Management Functions
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      toast.error("Semua field harus diisi!");
      return;
    }

    try {
      const response = await api.admin.createUser({
        fullName: newUser.name,
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        status: "Aktif",
      });

      // Reload users list
      await loadUsers();
      
      setNewUser({ name: "", username: "", password: "", role: "petani" });
      setIsAddDialogOpen(false);
      toast.success(`Petani ${newUser.name} berhasil ditambahkan!`);
    } catch (error) {
      console.error("Gagal menambahkan user:", error);
      toast.error("Gagal menambahkan petani: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleDeleteUser = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    
    setUserToDelete({ id, name: user.name });
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.admin.deleteUser(userToDelete.id);
      // Reload users list
      await loadUsers();
      toast.success(`Petani ${userToDelete.name} berhasil dihapus!`);
      setIsDeleteUserDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      toast.error("Gagal menghapus petani: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      username: user.username,
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser.name) {
      toast.error("Nama harus diisi!");
      return;
    }

    try {
      await api.admin.updateUser(editingUser.id, {
        fullName: editingUser.name,
        status: editingUser.status,
      });

      // Reload users list
      await loadUsers();
      
      setEditingUser(null);
      setIsEditDialogOpen(false);
      toast.success("Petani berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui user:", error);
      toast.error("Gagal memperbarui petani: " + (error.message || "Terjadi kesalahan"));
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format gambar tidak valid! Gunakan JPG, PNG, atau GIF.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar terlalu besar! Maksimal 5MB.");
      return;
    }

    try {
      setUploadingImage(true);
      
      // Upload image to backend
      const response = await api.news.uploadImage(file);
      const imageUrl = response.imageUrl;

      // Create preview URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing && editingArticle) {
          setEditingArticle({
            ...editingArticle,
            imageUrl: imageUrl,
            imageFile: file,
            imagePreview: reader.result
          });
        } else {
          setNewArticle({
            ...newArticle,
            imageUrl: imageUrl,
            imageFile: file,
            imagePreview: reader.result
          });
        }
      };
      reader.readAsDataURL(file);
      
      toast.success("Gambar berhasil diunggah!");
    } catch (error) {
      console.error("Gagal mengunggah gambar:", error);
      toast.error("Gagal mengunggah gambar: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (isEditing = false) => {
    if (isEditing && editingArticle) {
      setEditingArticle({
        ...editingArticle,
        imageUrl: "",
        imageFile: null,
        imagePreview: null
      });
    } else {
      setNewArticle({
        ...newArticle,
        imageUrl: "",
        imageFile: null,
        imagePreview: null
      });
    }
    toast.info("Gambar dihapus");
  };

  // News Management Functions
  const handleAddArticle = async () => {
    if (!newArticle.title || !newArticle.content) {
      toast.error("Judul dan konten harus diisi!");
      return;
    }

    try {
      const articleData = {
        title: newArticle.title,
        content: newArticle.content,
        imageUrl: newArticle.imageUrl || "",
        status: newArticle.status,
        date: new Date().toISOString().split('T')[0],
      };

      await api.news.create(articleData);
      
      // Reload news list
      await loadNews();
      
      setNewArticle({ title: "", content: "", imageUrl: "", imageFile: null, status: "Draft", imagePreview: null });
      setIsAddNewsDialogOpen(false);
      toast.success("Berita berhasil ditambahkan!");
    } catch (error) {
      console.error("Gagal menambahkan berita:", error);
      toast.error("Gagal menambahkan berita: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleDeleteArticle = (id) => {
    const article = newsArticles.find((a) => a.id === id);
    if (!article) return;
    
    setArticleToDelete({ id, title: article.title });
    setIsDeleteNewsDialogOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;

    try {
      await api.news.delete(articleToDelete.id);
      // Reload news list
      await loadNews();
      toast.success(`Berita "${articleToDelete.title}" berhasil dihapus!`);
      setIsDeleteNewsDialogOpen(false);
      setArticleToDelete(null);
    } catch (error) {
      console.error("Gagal menghapus berita:", error);
      toast.error("Gagal menghapus berita: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleEditArticle = (article) => {
    setEditingArticle({
      ...article,
      imagePreview: null // Don't set imagePreview, let ImageWithFallback handle the URL
    });
    setIsEditNewsDialogOpen(true);
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle || !editingArticle.title || !editingArticle.content) {
      toast.error("Judul dan konten harus diisi!");
      return;
    }

    try {
      const articleData = {
        title: editingArticle.title,
        content: editingArticle.content,
        imageUrl: editingArticle.imageUrl || "",
        status: editingArticle.status,
        date: editingArticle.date || new Date().toISOString().split('T')[0],
      };

      await api.news.update(editingArticle.id, articleData);
      
      // Reload news list
      await loadNews();
      
      setEditingArticle(null);
      setIsEditNewsDialogOpen(false);
      toast.success("Berita berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui berita:", error);
      toast.error("Gagal memperbarui berita: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const handleSaveParameters = async () => {
    try {
      setLoadingParameters(true);
      
      const response = await api.admin.updateParameters({
        defaultDepth: defaultDepth[0],
        defaultSpacing: defaultSpacing[0],
      });
      
      // Update state with response from backend
      if (response.defaultDepth !== undefined) {
        setDefaultDepth([response.defaultDepth]);
      }
      if (response.defaultSpacing !== undefined) {
        setDefaultSpacing([response.defaultSpacing]);
      }
      
      toast.success("Parameter default berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan parameters:", error);
      toast.error("Gagal menyimpan parameter default: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setLoadingParameters(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static w-64 bg-white border-r h-screen transition-transform z-40`}
      >
        <div className="p-6 border-b bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex flex-col gap-2">
            <img 
              src={logoMedium} 
              alt="Seedbot" 
              className="object-contain"
              style={{ height: '64px', width: '128px', aspectRatio: '2/1' }}
            />
            <p className="text-xs text-slate-500 ml-1">Admin Panel</p>
          </div>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  activeMenu === item.id
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mt-4 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-gray-800">
                {menuItems.find((m) => m.id === activeMenu)?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 shadow-sm">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">{adminName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Admin</span>
                <span className="text-sm text-emerald-700">{adminName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeMenu === "parameter-default" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parameter Default Sistem</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingParameters ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                      <p className="text-gray-600">Memuat parameter default...</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Kedalaman Tanam Default */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Kedalaman Tanam Default (cm)</Label>
                          <span className="text-emerald-600 font-semibold">{defaultDepth[0]} cm</span>
                        </div>
                        <Slider
                          value={defaultDepth}
                          onValueChange={setDefaultDepth}
                          min={3}
                          max={10}
                          step={0.5}
                          className="w-full"
                          disabled={loadingParameters}
                        />
                        <p className="text-xs text-gray-500">Parameter ini akan diterapkan untuk semua petani baru</p>
                      </div>

                      {/* Jarak Antar Benih Default */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Jarak Antar Benih Default (cm)</Label>
                          <span className="text-emerald-600 font-semibold">{defaultSpacing[0]} cm</span>
                        </div>
                        <Slider
                          value={defaultSpacing}
                          onValueChange={setDefaultSpacing}
                          min={15}
                          max={30}
                          step={1}
                          className="w-full"
                          disabled={loadingParameters}
                        />
                        <p className="text-xs text-gray-500">Jarak optimal untuk tanaman jagung</p>
                      </div>

                      <Button 
                        onClick={handleSaveParameters}
                        disabled={loadingParameters}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingParameters ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Simpan Parameter Default
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "kelola-petani" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-gray-800">Daftar Petani</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Tambah Petani Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Petani Baru</DialogTitle>
                      <DialogDescription>
                        Masukkan data petani yang akan didaftarkan
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          placeholder="Masukkan nama lengkap"
                          value={newUser.name}
                          onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Masukkan username"
                          value={newUser.username}
                          onChange={(e) =>
                            setNewUser({ ...newUser, username: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Masukkan password"
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                        />
                      </div>
                      <Button
                        onClick={handleAddUser}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        Tambah Petani
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  {loadingUsers ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                      <p className="text-gray-600">Memuat daftar petani...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">Belum ada petani terdaftar</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  user.status === "Aktif"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {user.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Edit User Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Petani</DialogTitle>
                    <DialogDescription>
                      Ubah data petani
                    </DialogDescription>
                  </DialogHeader>
                  {editingUser && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Nama Lengkap</Label>
                        <Input
                          id="edit-name"
                          placeholder="Masukkan nama lengkap"
                          value={editingUser.name}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-username">Username</Label>
                        <Input
                          id="edit-username"
                          placeholder="Masukkan username"
                          value={editingUser.username}
                          disabled
                          className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500">Username tidak dapat diubah</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <Select
                          value={editingUser.status}
                          onValueChange={(value) =>
                            setEditingUser({ ...editingUser, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aktif">Aktif</SelectItem>
                            <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleUpdateUser}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        Simpan Perubahan
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Delete User Confirmation Dialog */}
              <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Petani</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus petani <strong>{userToDelete?.name}</strong>? 
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                      setIsDeleteUserDialogOpen(false);
                      setUserToDelete(null);
                    }}>
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDeleteUser}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {activeMenu === "berita" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-gray-800">Daftar Berita</h2>
                <Dialog open={isAddNewsDialogOpen} onOpenChange={setIsAddNewsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Berita Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Berita Baru</DialogTitle>
                      <DialogDescription>
                        Buat artikel berita untuk ditampilkan di halaman petani
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="news-title">Judul Berita</Label>
                        <Input
                          id="news-title"
                          placeholder="Masukkan judul berita"
                          value={newArticle.title}
                          onChange={(e) =>
                            setNewArticle({ ...newArticle, title: e.target.value })
                          }
                        />
                      </div>

                      {/* Image Upload Section */}
                      <div className="space-y-2">
                        <Label>Gambar Berita</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-500 transition-colors">
                          {uploadingImage ? (
                            <div className="flex flex-col items-center py-8">
                              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                              <span className="text-sm text-gray-600">Mengunggah gambar...</span>
                            </div>
                          ) : newArticle.imageUrl || newArticle.imagePreview ? (
                            <div className="relative">
                              {newArticle.imagePreview ? (
                                <img 
                                  src={newArticle.imagePreview} 
                                  alt="Preview" 
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              ) : (
                                <ImageWithFallback
                                  src={newArticle.imageUrl}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              )}
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => handleRemoveImage(false)}
                                disabled={uploadingImage}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center cursor-pointer py-4">
                              <Upload className="w-12 h-12 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600 mb-1">
                                Klik untuk upload gambar
                              </span>
                              <span className="text-xs text-gray-400">
                                JPG, PNG, atau GIF (Max. 5MB)
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, false)}
                                disabled={uploadingImage}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="news-content">Konten</Label>
                        <Textarea
                          id="news-content"
                          placeholder="Masukkan konten berita"
                          value={newArticle.content}
                          onChange={(e) =>
                            setNewArticle({ ...newArticle, content: e.target.value })
                          }
                          rows={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="news-status">Status</Label>
                        <Select
                          value={newArticle.status}
                          onValueChange={(value) =>
                            setNewArticle({ ...newArticle, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleAddArticle}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        Tambah Berita
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  {loadingNews ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                      <p className="text-gray-600">Memuat daftar berita...</p>
                    </div>
                  ) : newsArticles.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">Belum ada berita</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Judul</TableHead>
                              <TableHead>Gambar</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {newsArticles.map((article) => (
                              <TableRow key={article.id}>
                                <TableCell className="max-w-md">
                                  <div>
                                    <p className="font-medium">{article.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {truncateText(article.content, 100)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {article.imageUrl ? (
                                    <ImageWithFallback
                                      src={article.imageUrl}
                                      alt={article.title}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                      <span className="text-xs text-gray-400">No Image</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {article.date ? new Date(article.date).toLocaleDateString("id-ID") : "-"}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                      article.status === "Published"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {article.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditArticle(article)}
                                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteArticle(article.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y">
                        {newsArticles.map((article) => (
                          <div key={article.id} className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              {article.imageUrl ? (
                                <ImageWithFallback
                                  src={article.imageUrl}
                                  alt={article.title}
                                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-gray-400">No Image</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{article.title}</p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {truncateText(article.content, 80)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">
                                  {article.date ? new Date(article.date).toLocaleDateString("id-ID") : "-"}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs w-fit ${
                                    article.status === "Published"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {article.status}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditArticle(article)}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteArticle(article.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Edit News Dialog */}
              <Dialog open={isEditNewsDialogOpen} onOpenChange={setIsEditNewsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Berita</DialogTitle>
                  </DialogHeader>
                  {editingArticle && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Judul Berita</Label>
                        <Input
                          value={editingArticle.title}
                          onChange={(e) =>
                            setEditingArticle({ ...editingArticle, title: e.target.value })
                          }
                        />
                      </div>

                      {/* Image Upload Section for Edit */}
                      <div className="space-y-2">
                        <Label>Gambar Berita</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-500 transition-colors">
                          {uploadingImage ? (
                            <div className="flex flex-col items-center">
                              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                              <span className="text-sm text-gray-600">Mengunggah gambar...</span>
                            </div>
                          ) : editingArticle.imageUrl || editingArticle.imagePreview ? (
                            <div className="relative">
                              {editingArticle.imagePreview ? (
                                <img 
                                  src={editingArticle.imagePreview} 
                                  alt="Preview" 
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              ) : (
                                <ImageWithFallback
                                  src={editingArticle.imageUrl}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              )}
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => handleRemoveImage(true)}
                                disabled={uploadingImage}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center cursor-pointer">
                              <Upload className="w-12 h-12 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600 mb-1">
                                Klik untuk upload gambar
                              </span>
                              <span className="text-xs text-gray-400">
                                JPG, PNG, atau GIF (Max. 5MB)
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, true)}
                                disabled={uploadingImage}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Konten</Label>
                        <Textarea
                          value={editingArticle.content}
                          onChange={(e) =>
                            setEditingArticle({ ...editingArticle, content: e.target.value })
                          }
                          rows={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={editingArticle.status}
                          onValueChange={(value) =>
                            setEditingArticle({ ...editingArticle, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleUpdateArticle}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        Simpan Perubahan
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Delete News Confirmation Dialog */}
              <AlertDialog open={isDeleteNewsDialogOpen} onOpenChange={setIsDeleteNewsDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Berita</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus berita <strong>"{articleToDelete?.title}"</strong>? 
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                      setIsDeleteNewsDialogOpen(false);
                      setArticleToDelete(null);
                    }}>
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDeleteArticle}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {activeMenu === "ganti-password" && (
            <div className="space-y-6">
              <h2 className="text-2xl text-gray-800">
                Ganti Password
              </h2>

              <Card className="w-full max-w-none" style={{ maxWidth: '2560px' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    Ubah Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-w-4xl">
                    {/* Password Lama */}
                    <div className="space-y-2">
                      <Label htmlFor="old-password">
                        Password Lama
                      </Label>
                      <Input
                        id="old-password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Masukkan password lama"
                        disabled={changingPassword}
                      />
                    </div>

                    {/* Password Baru */}
                    <div className="space-y-2">
                      <Label htmlFor="new-password">
                        Password Baru
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan password baru (min. 6 karakter)"
                        disabled={changingPassword}
                      />
                      <p className="text-xs text-gray-500">
                        Password baru harus minimal 6 karakter
                      </p>
                    </div>

                    {/* Konfirmasi Password Baru */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Konfirmasi Password Baru
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Konfirmasi password baru"
                        disabled={changingPassword}
                      />
                    </div>

                    {/* Button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {changingPassword ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Mengubah Password...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Ubah Password
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Info className="w-4 h-4 inline mr-2" />
                        Pastikan password baru Anda kuat dan mudah diingat. Setelah password diubah, Anda perlu login ulang dengan password baru.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
