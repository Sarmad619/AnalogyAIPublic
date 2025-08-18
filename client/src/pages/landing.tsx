import { Button } from "@/components/ui/button";

export function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 10% 20%, rgba(255, 193, 7, 0.1), transparent 30%),
                        radial-gradient(circle at 80% 90%, rgba(255, 193, 7, 0.1), transparent 30%)`,
            animation: 'animate-gradient 20s ease-in-out infinite'
          }}
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-4xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 p-4">
        <nav className="glassmorphism-strong flex justify-between items-center p-4 rounded-2xl">
          <h1 className="font-mono text-xl md:text-2xl font-bold gradient-text">
            Analogy AI
          </h1>
        </nav>
      </header>

      {/* Main content */}
      <main className="w-full max-w-2xl text-center mt-20">
        <div className="glassmorphism-strong p-8 md:p-12 rounded-2xl">
          <h2 className="font-mono text-3xl md:text-4xl font-bold gradient-text mb-4">
            Unlock Understanding
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Transform complex topics into simple, personalized analogies. 
            Sign in to begin your learning journey and save your progress.
          </p>
          <Button 
            onClick={handleSignIn}
            className="bg-primary text-primary-foreground font-bold font-mono py-3 px-8 rounded-lg hover:opacity-90 transition-all duration-300 text-lg"
          >
            Sign In to Get Started
          </Button>
        </div>
      </main>

      {/* Features preview */}
      <div className="w-full max-w-4xl mt-16 grid md:grid-cols-3 gap-6 px-4">
        <div className="glassmorphism p-6 text-center rounded-2xl animate-float">
          <div className="text-primary text-3xl mb-3">🧠</div>
          <h3 className="font-mono font-semibold text-white mb-2">Personalized Learning</h3>
          <p className="text-gray-300 text-sm">
            Analogies tailored to your interests and knowledge level
          </p>
        </div>
        <div className="glassmorphism p-6 text-center rounded-2xl animate-float" style={{ animationDelay: '2s' }}>
          <div className="text-primary text-3xl mb-3">📚</div>
          <h3 className="font-mono font-semibold text-white mb-2">Save & Organize</h3>
          <p className="text-gray-300 text-sm">
            Keep track of your favorite analogies and learning progress
          </p>
        </div>
        <div className="glassmorphism p-6 text-center rounded-2xl animate-float" style={{ animationDelay: '4s' }}>
          <div className="text-primary text-3xl mb-3">⚡</div>
          <h3 className="font-mono font-semibold text-white mb-2">Instant Clarity</h3>
          <p className="text-gray-300 text-sm">
            Get clear explanations for any complex topic in seconds
          </p>
        </div>
      </div>
    </div>
  );
}