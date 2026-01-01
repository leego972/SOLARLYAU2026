import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from './ui/button';
import { Play, X } from 'lucide-react';

interface ProductTourProps {
  autoStart?: boolean;
  onComplete?: () => void;
}

export function ProductTour({ autoStart = false, onComplete }: ProductTourProps) {
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    // Check if tour was already completed
    const completed = localStorage.getItem('productTourCompleted');
    if (completed) {
      setTourCompleted(true);
    } else if (autoStart) {
      // Auto-start tour for first-time users
      setTimeout(() => startTour(), 1000);
    }
  }, [autoStart]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: '#dashboard-welcome',
          popover: {
            title: '👋 Welcome to SolarlyAU!',
            description: 'Let me show you how to get your first solar leads in under 2 minutes.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#leads-section',
          popover: {
            title: '🎯 High-Quality Leads',
            description: 'Browse 637+ verified solar leads across QLD, NSW, VIC, WA, and SA. Each lead includes customer contact details, property info, and energy usage data.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#lead-filters',
          popover: {
            title: '🔍 Filter by Location',
            description: 'Use filters to find leads in your service area. You only see leads that match your state and service radius.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#lead-card',
          popover: {
            title: '📋 Lead Details',
            description: 'Each lead shows: Customer name, phone, email, property address, roof type, current energy bill, and urgency level.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#buy-lead-button',
          popover: {
            title: '💳 Purchase Leads',
            description: 'Click "Buy Lead" to purchase. Pricing: Premium ($300), Standard ($200), Basic ($100). Use code LAUNCH20 for 20% off your first 5 leads!',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#my-leads-tab',
          popover: {
            title: '📦 Your Purchased Leads',
            description: 'After purchase, leads appear here with full contact details. Export to CSV or integrate with your CRM.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#pricing-link',
          popover: {
            title: '💰 Transparent Pricing',
            description: 'No subscriptions. No monthly fees. Pay only for leads you buy. Average ROI: 400% (installers make $1,200-$3,000 per lead).',
            side: 'left',
            align: 'start'
          }
        },
        {
          popover: {
            title: '🚀 You\'re Ready!',
            description: 'That\'s it! Start browsing leads now and get your first customer today. Questions? Contact support@solarlyau.com',
            side: 'top',
            align: 'center'
          }
        }
      ],
      onDestroyStarted: () => {
        if (driverObj.hasNextStep()) {
          // Tour was cancelled before completion
          return;
        }
        // Tour completed
        localStorage.setItem('productTourCompleted', 'true');
        setTourCompleted(true);
        onComplete?.();
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  if (tourCompleted) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={startTour}
        className="gap-2"
      >
        <Play className="h-4 w-4" />
        Replay Tour
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <Button
        onClick={startTour}
        size="lg"
        className="gap-2 shadow-lg animate-pulse"
      >
        <Play className="h-5 w-5" />
        Start Product Tour
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          localStorage.setItem('productTourCompleted', 'true');
          setTourCompleted(true);
        }}
        className="gap-1 text-xs"
      >
        <X className="h-3 w-3" />
        Skip
      </Button>
    </div>
  );
}

// Simplified version for dashboard integration
export function QuickTourButton() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: '#leads-section',
          popover: {
            title: '🎯 Browse Leads',
            description: 'View all available solar leads in your area.',
            side: 'right'
          }
        },
        {
          element: '#buy-lead-button',
          popover: {
            title: '💳 Buy Leads',
            description: 'Click to purchase leads instantly. Use LAUNCH20 for 20% off!',
            side: 'top'
          }
        },
        {
          element: '#my-leads-tab',
          popover: {
            title: '📦 Your Leads',
            description: 'Access purchased leads with full customer details.',
            side: 'bottom'
          }
        }
      ],
      onDestroyStarted: () => {
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startTour}
      className="gap-2"
    >
      <Play className="h-4 w-4" />
      Quick Tour
    </Button>
  );
}
