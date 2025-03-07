import { useRouter } from 'next/router';
import { ArrowRightCircle } from 'lucide-react';

export default function IndexPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <div className="mb-8">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-[300px] h-auto sm:w-[500px] md:w-[700px] lg:w-[650px]"
          >
            <source src="/IndexDesign.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="mt-8 p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg 
                     transform transition-all duration-300 ease-in-out
                     hover:scale-110 hover:shadow-xl hover:rotate-12
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Enter Application"
        >
          <ArrowRightCircle 
            size={36}
            className="animate-pulse"
          />
        </button>
      </div>
    </div>
  );
}