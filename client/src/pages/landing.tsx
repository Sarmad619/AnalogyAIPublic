import { Button } from "@/components/ui/button";

export function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="nav-sticky sticky top-0 z-50">
        <div className="section-container py-4">
          <nav className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gradient">
              Analogy AI
            </h1>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            Unlock Understanding
          </h2>
          <p className="section-subtitle">
            Transform complex topics into simple, personalized analogies.<br />
            Sign in to begin your learning journey and save your progress.
          </p>
        </div>

        <div className="text-center mb-16">
          <Button 
            onClick={handleSignIn}
            className="btn-primary text-lg px-8 py-3"
          >
            Sign In to Get Started
          </Button>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-minimal p-6 text-center">
            <div className="text-primary text-3xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold text-white mb-3">Personalized Learning</h3>
            <p className="text-muted-foreground text-sm">
              Analogies tailored to your interests and knowledge level
            </p>
          </div>
          <div className="card-minimal p-6 text-center">
            <div className="text-primary text-3xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-white mb-3">Save & Organize</h3>
            <p className="text-muted-foreground text-sm">
              Keep track of your favorite analogies and learning progress
            </p>
          </div>
          <div className="card-minimal p-6 text-center">
            <div className="text-primary text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-3">Instant Clarity</h3>
            <p className="text-muted-foreground text-sm">
              Get clear explanations for any complex topic in seconds
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}