// src/pages/HomePage.tsx
// Import the image from the assets folder
import heroImageSrc from '@/assets/cgsaem_visualization.png'; // Using path alias for src



export function HomePage() {
  return (
    <div className="container mx-auto py-10 px-4 flex flex-col items-center text-center">
      {/* Application Header */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary mb-4">
        CGASSEF
      </h1>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-8">
        Comprehensive (Generative) AI Service Sustainability Assessment Framework
      </h2>
      <div className="w-full max-w-3xl border-t border-border my-6 md:my-8"></div> {/* Adjusted divider */}

      {/* Application Description */}
      <p className="max-w-3xl text-lg sm:text-xl text-muted-foreground mb-10 md:mb-12 leading-relaxed">
        The CGASSEF tool is designed to help organizations assess the environmental impact of Generative AI applications
        across their life cycle. It provides intuitive dashboards, customizable metrics, and scenario simulations
        to visualize energy use, CO₂ emissions, and ESG factors—making sustainability insights accessible for
        technical and non-technical stakeholders alike.
      </p>

      {/* Image Display */}
      <div className="w-full max-w-3xl lg:max-w-4xl mb-10 md:mb-12 shadow-xl rounded-lg overflow-hidden border"> {/* Added border */}
        <img
          src={heroImageSrc} // Use the imported image source
          alt="CGSAEM Visualization - AI Sustainability Assessment"
          className="w-full h-auto object-contain"
        />
      </div>

    </div>
  );
}