/**
 * @file HomePage.tsx
 * @description Implements the main landing page for the CGASSEF web prototype.
 * This page serves as the initial entry point for users, providing a high-level
 * overview of the tool's purpose and its key features. 
 * @author Marwin Ahnfeldt
 */

// Import the representative image from the assets folder.
import heroImageSrc from '@/assets/cgsaem_visualization.png'; 
// Import a UI icon for visual enhancement of the features list.
import { CheckCircle } from 'lucide-react'; // For bullet point icons


/**
 * The HomePage component renders the static content for the application's landing page. It is a purely presentational component that 
 * does not handle state or business logic. Its primary role is to welcome the user and outline the four main functions of the
 * CGASSEF tool: Enter/Edit AI-related inputs, Visualize Impact of AI Service, Compare Impacts of AI Service, and Export Impact data.
 *
 * @returns {JSX.Element} The rendered home page view, which is the main entry point of the application.
 */
export function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center text-center">
      {/* First section - Application Header */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary mb-3">
        CGASSEF
      </h1>
      <h2 className="text-2xl sm:text-xl md:text-3xl font-medium tracking-tight text-foreground mb-8 max-w-3xl"> {/* Adjusted size & max-width */}
        Comprehensive (Generative) AI Service Sustainability Assessment Framework
      </h2>
      
      {/* Second section - Visual representation */}
      <div className="w-full max-w-2xl lg:max-w-3xl mb-10 md:mb-12 shadow-2xl rounded-lg overflow-hidden border-2 border-primary/20"> {/* Enhanced styling */}
        <img
          src={heroImageSrc}
          alt="AI Sustainability Assessment Visualization"
          className="w-full h-auto object-cover" // Changed to object-cover for better fill
        />
      </div>

      {/* Third section - Application Description explaining the objective and value proposition of the CGASSEF tool */}
      <p className="max-w-3xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
        The CGASSEF tool is designed to help organizations assess the environmental impact of Generative AI applications
        across their life cycle. It provides intuitive dashboards and metrics 
        to make AI service sustainability insights accessible for
        technical and non-technical stakeholders alike.
      </p>

      {/* Fourth - Section - List explaining the core functionalities of the prototype, corresponding to the navigation tab bar*/}
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