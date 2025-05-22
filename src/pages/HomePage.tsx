// src/pages/HomePage.tsx

// Import the image from the assets folder
import heroImageSrc from '@/assets/cgsaem_visualization.png'; // Using path alias for src
import { CheckCircle } from 'lucide-react'; // For bullet point icons

export function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center text-center">
      {/* Application Header */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary mb-3">
        CGASSEF
      </h1>
      <h2 className="text-2xl sm:text-xl md:text-3xl font-medium tracking-tight text-foreground mb-8 max-w-3xl"> {/* Adjusted size & max-width */}
        Comprehensive (Generative) AI Service Sustainability Assessment Framework
      </h2>
      
      {/* Image Display - Moved up for better visual flow */}
      <div className="w-full max-w-2xl lg:max-w-3xl mb-10 md:mb-12 shadow-2xl rounded-lg overflow-hidden border-2 border-primary/20"> {/* Enhanced styling */}
        <img
          src={heroImageSrc}
          alt="AI Sustainability Assessment Visualization"
          className="w-full h-auto object-cover" // Changed to object-cover for better fill
        />
      </div>

      {/* Application Description */}
      <p className="max-w-3xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
        The CGASSEF tool is designed to help organizations assess the environmental impact of Generative AI applications
        across their life cycle. It provides intuitive dashboards and metrics 
        to make AI service sustainability insights accessible for
        technical and non-technical stakeholders alike.
      </p>

      {/* Key Features Section */}
      <div className="w-full max-w-3xl mb-12">
        <h3 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6">Key Features</h3>
        <ul className="space-y-4 text-left text-lg text-muted-foreground">
          <li className="flex items-start">
            <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
            <span>
              <strong>Create/Edit AI Service Impact:</strong> Define and configure the CO₂ impact parameters for each lifecycle stage of your AI services.
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
            <span>
              <strong>Visualize AI Service Impact:</strong> Upload your service configurations to generate insightful charts detailing CO₂ emissions by stage.
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
            <span>
              <strong>Compare AI Services:</strong> Analyze multiple AI services side-by-side using a radar chart to evaluate their sustainability profiles across various metrics.
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
            <span>
              <strong>Export Impact / ESG Data:</strong> Download detailed impact assessments in CSV format for reporting, further analysis, or ESG compliance.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}