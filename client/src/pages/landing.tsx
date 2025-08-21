import { Button } from "@/components/ui/button";

export function Landing() {
  const handleSignIn = () => {
    // This now redirects to our secure backend route to start the Google OAuth flow
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.1), transparent 30%),
                        radial-gradient(circle at 80% 90%, rgba(245, 158, 11, 0.1), transparent 30%)`,
            animation: 'gradient-shift 20s ease-in-out infinite'
          }}
        />
      </div>

      <header className="w-full max-w-4xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 p-4">
        <nav className="glassmorphism-strong flex justify-between items-center p-4 rounded-2xl">
          <h1 className="text-xl md:text-2xl font-bold gradient-text">
            Analogy AI
          </h1>
        </nav>
      </header>

      <main className="w-full max-w-2xl text-center mt-20">
        <div className="glassmorphism-strong p-8 md:p-12 rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Unlock Understanding
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Transform complex topics into simple, personalized analogies. 
            Sign in with your Google account to begin your learning journey.
          </p>
          <Button 
            onClick={handleSignIn}
            className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-all duration-300 text-lg"
          >
            Sign In with Google
          </Button>
        </div>
      </main>
    </div>
  );
}