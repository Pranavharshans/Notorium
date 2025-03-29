import { BackgroundPaths } from "@/components/ui/background-paths";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundPaths />
      <div className="relative z-10 flex flex-col items-center pt-32 text-white text-center px-4">
        <h1 className="text-7xl md:text-9xl font-bold mb-12 tracking-tight">
          NOTORIUM AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed mt-4">
          Transform your lectures into comprehensive notes with AI-powered transcription and note generation
        </p>
      </div>
    </div>
  );
}
