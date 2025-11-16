import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Loader2, Lock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import logoMedium from "figma:asset/6931a194092f1fc319eb76cb6dbe2b371fb5d49e.png";
import api from "../services/api";
import { toast } from "sonner@2.0.3";

export function ForgotPasswordPage({ onBack, onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: username, 2: token, 3: new password
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayedToken, setDisplayedToken] = useState("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [tokenExpiresIn, setTokenExpiresIn] = useState(0);
  const [requestNewTokenCountdown, setRequestNewTokenCountdown] = useState(0);
  
  const tokenCountdownRef = useRef(null);
  const requestCountdownRef = useRef(null);

  // Countdown for token expiry
  useEffect(() => {
    if (step === 2 && tokenExpiresIn > 0) {
      tokenCountdownRef.current = setInterval(() => {
        setTokenExpiresIn((prev) => {
          if (prev <= 1) {
            clearInterval(tokenCountdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (tokenCountdownRef.current) {
        clearInterval(tokenCountdownRef.current);
      }
    };
  }, [step, tokenExpiresIn]);

  // Countdown for request new token (1 minute cooldown)
  useEffect(() => {
    if (requestNewTokenCountdown > 0) {
      requestCountdownRef.current = setInterval(() => {
        setRequestNewTokenCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(requestCountdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (requestCountdownRef.current) {
        clearInterval(requestCountdownRef.current);
      }
    };
  }, [requestNewTokenCountdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestToken = async () => {
    if (!username.trim()) {
      setError("Username harus diisi!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await api.auth.forgotPassword(username);
      
      setDisplayedToken(response.token);
      setTokenExpiresAt(response.expiresAt);
      setTokenExpiresIn(response.expiresIn);
      setStep(2);
      setRequestNewTokenCountdown(60); // 1 minute countdown before can request new token
      
      toast.success("Token berhasil dibuat!");
    } catch (error) {
      setError(error.message || "Gagal meminta token");
      // Check if error is about waiting time
      if (error.message && error.message.includes("detik lagi")) {
        const match = error.message.match(/(\d+)\s+detik/);
        if (match) {
          setRequestNewTokenCountdown(parseInt(match[1]));
          setCanRequestNewToken(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      setError("Token harus diisi!");
      return;
    }

    if (token.length !== 6) {
      setError("Token harus 6 digit!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await api.auth.verifyResetToken(username, token);
      
      setTokenExpiresIn(response.expiresIn);
      setTokenExpiresAt(response.expiresAt);
      setStep(3);
      toast.success("Token valid! Silakan buat password baru.");
    } catch (error) {
      setError(error.message || "Token tidak valid");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Semua field harus diisi!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await api.auth.resetPassword(username, token, newPassword);
      
      toast.success("Password berhasil direset! Silakan login dengan password baru.");
      onBackToLogin();
    } catch (error) {
      setError(error.message || "Gagal mereset password");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewToken = async () => {
    if (requestNewTokenCountdown > 0) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await api.auth.forgotPassword(username);
      
      setDisplayedToken(response.token);
      setTokenExpiresAt(response.expiresAt);
      setTokenExpiresIn(response.expiresIn);
      setToken(""); // Clear old token input
      setRequestNewTokenCountdown(60); // 1 minute countdown before can request again
      
      toast.success("Token baru berhasil dibuat!");
    } catch (error) {
      setError(error.message || "Gagal meminta token baru");
      if (error.message && error.message.includes("detik lagi")) {
        const match = error.message.match(/(\d+)\s+detik/);
        if (match) {
          setRequestNewTokenCountdown(parseInt(match[1]));
          setCanRequestNewToken(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img 
              src={logoMedium} 
              alt="Seedbot" 
              className="h-20 w-auto"
            />
          </div>
          <p className="text-slate-600">Lupa Password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              {step === 1 && "Masukkan Username"}
              {step === 2 && "Masukkan Token"}
              {step === 3 && "Buat Password Baru"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Masukkan username Anda untuk mendapatkan token reset password"}
              {step === 2 && "Masukkan token 6 digit yang telah dikirim"}
              {step === 3 && "Buat password baru untuk akun Anda"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Username */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleRequestToken}
                  disabled={loading || !username.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Minta Token
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Token */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Display Token (for demo) */}
                {displayedToken && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-xs text-emerald-700 font-medium mb-2">
                      Token Reset Password (Demo):
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-mono font-bold text-emerald-700">
                        {displayedToken}
                      </p>
                      {tokenExpiresIn > 0 && (
                        <div className="text-sm text-emerald-600">
                          <span className="font-medium">Kadaluarsa dalam:</span>{" "}
                          <span className="font-mono">{formatTime(tokenExpiresIn)}</span>
                        </div>
                      )}
                    </div>
                    {tokenExpiresIn === 0 && (
                      <p className="text-xs text-red-600 mt-2">
                        Token sudah kadaluarsa. Silakan minta token baru.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="token">Token (6 digit)</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Masukkan token 6 digit"
                    value={token}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setToken(value);
                    }}
                    maxLength={6}
                    disabled={loading || tokenExpiresIn === 0}
                    className="text-center text-2xl font-mono tracking-widest"
                    required
                  />
                </div>

                {/* Request New Token Button */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRequestNewToken}
                    disabled={loading || requestNewTokenCountdown > 0}
                    className="flex-1"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {requestNewTokenCountdown > 0 
                      ? `Minta Lagi (${formatTime(requestNewTokenCountdown)})`
                      : "Minta Token Baru"
                    }
                  </Button>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleVerifyToken}
                  disabled={loading || !token || token.length !== 6 || tokenExpiresIn === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verifikasi Token
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Masukkan password baru (min. 6 karakter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Password baru harus minimal 6 karakter
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Konfirmasi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleResetPassword}
                  disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mereset Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 space-y-2">
              {step > 1 && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                    if (step === 2) {
                      setToken("");
                    }
                  }}
                  className="w-full text-gray-600 hover:text-emerald-600"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="w-full text-gray-600 hover:text-[#2E8B57]"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

