import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Heart, MessageCircle, Sparkles, ShoppingBag, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect authenticated users to feed
  if (isAuthenticated && user) {
    navigate("/feed");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              INQAR
            </span>
          </div>
          <a href={getLoginUrl()} className="text-slate-700 hover:text-slate-900 font-medium">
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Connect, Create, and Thrive
              </h1>
              <p className="text-xl text-slate-600">
                INQAR is your premium social platform combining stunning content sharing, intelligent marketplace, and exclusive VIP experiences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Get Started
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Heart className="w-8 h-8 text-pink-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Share & Connect</h3>
              <p className="text-sm text-slate-600">Post photos, videos, and stories</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <ShoppingBag className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">InQ Bazar</h3>
              <p className="text-sm text-slate-600">Buy and sell amazing products</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles className="w-8 h-8 text-amber-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">INQAR AI</h3>
              <p className="text-sm text-slate-600">Intelligent recommendations</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Users className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">VIP Status</h3>
              <p className="text-sm text-slate-600">Exclusive benefits & features</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600">
              A complete social and commerce platform designed for creators and communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Social Features",
                description: "Posts, stories, likes, comments, and direct messaging",
              },
              {
                icon: ShoppingBag,
                title: "InQ Bazar Marketplace",
                description: "Sell products, manage orders, and build your shop",
              },
              {
                icon: Sparkles,
                title: "INQAR AI Assistant",
                description: "Get personalized recommendations and smart insights",
              },
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <h2 className="text-4xl font-bold">Ready to join INQAR?</h2>
          <p className="text-lg opacity-90">
            Create your account and start connecting with millions of creators
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100">
              Sign Up Now
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg" />
              <span className="font-semibold text-white">INQAR</span>
            </div>
            <p className="text-sm">© 2026 INQAR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
