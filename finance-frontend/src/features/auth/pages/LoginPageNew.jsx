import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { DollarSign, Lock, User } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { useSnackbar } from "notistack";

export default function LoginPageNew() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
      enqueueSnackbar('Login successful! Welcome back.', { variant: 'success' });

      // Use window.location to force a full page reload and avoid state issues
      window.location.href = '/dashboard';
    } catch (error) {
      const errorMessage = error?.message || 'Invalid email or password';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(240, 253, 244, 0.9), rgba(209, 250, 229, 0.85), rgba(204, 251, 241, 0.9)), url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-green-100 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-green-800">Welcome Back</CardTitle>
          <CardDescription className="text-green-600">
            Sign in to manage your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-green-200 focus-visible:ring-green-500 focus-visible:border-green-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-green-200 focus-visible:ring-green-500 focus-visible:border-green-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-sm text-green-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-green-300 text-green-600 focus:ring-green-500"
                  disabled={isLoading}
                />
                Remember me
              </label>
              <a href="#" className="text-sm text-green-600 hover:text-green-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-200 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-green-600">
                Don't have an account?{" "}
                <a href="/register" className="text-green-700 hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl"></div>
    </div>
  );
}
