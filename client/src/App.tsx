import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import LeadOptIn from "./pages/LeadOptIn";
import InstallerSignup from "./pages/InstallerSignup";
import InstallerDashboard from "./pages/InstallerDashboard";
import LeadCheckout from "./pages/LeadCheckout";
import Pricing from "./pages/Pricing";
import ForInstallers from "./pages/ForInstallers";
import FAQ from "./pages/FAQ";
import SuccessStories from "./pages/SuccessStories";
import ReferralDashboard from "./pages/ReferralDashboard";
import GetQuote from "./pages/GetQuote";
import QuoteSubmitted from "./pages/QuoteSubmitted";
import GoogleAdsDashboard from "./pages/GoogleAdsDashboard";
import InstallerPerformance from "./pages/InstallerPerformance";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import FAQChatbot from "./components/FAQChatbot";
import CookieConsent from "./components/CookieConsent";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import Blog from "./pages/Blog";
import InstallerDirectory from "./pages/InstallerDirectory";
import Contact from "./pages/Contact";
import BlogArticle from "./pages/BlogArticle";
import InstallerProfile from "./pages/InstallerProfile";
import RateInstaller from "./pages/RateInstaller";
import TrackQuote from "./pages/TrackQuote";
import AdminContent from "./pages/AdminContent";
import InstallerCheckout from "./pages/InstallerCheckout";
import RevenueDashboard from "./pages/RevenueDashboard";
import SuccessMetrics from "./pages/SuccessMetrics";
import AdminMetricsDashboard from "./pages/AdminMetricsDashboard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/for-installers" component={ForInstallers} />
      <Route path="/faq" component={FAQ} />
      <Route path="/success-stories" component={SuccessStories} />
      <Route path="/success-metrics" component={SuccessMetrics} />
      <Route path="/referrals" component={ReferralDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/google-ads" component={GoogleAdsDashboard} />
      <Route path="/admin/revenue" component={RevenueDashboard} />
      <Route path="/admin/metrics" component={AdminMetricsDashboard} />
      <Route path="/get-quotes" component={LeadOptIn} />
      <Route path="/get-quote" component={GetQuote} />
      <Route path="/quote-submitted" component={QuoteSubmitted} />
      <Route path="/installer/signup" component={InstallerSignup} />
      <Route path="/installer/dashboard" component={InstallerDashboard} />
      <Route path="/installer/performance" component={InstallerPerformance} />
      <Route path="/installer/checkout/:id" component={InstallerCheckout} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/about" component={About} />
      <Route path="/testimonials" component={Testimonials} />
      <Route path="/blog" component={Blog} />
      <Route path="/installers" component={InstallerDirectory} />
      <Route path="/installers/:id" component={InstallerProfile} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog/:slug" component={BlogArticle} />
      <Route path="/rate-installer" component={RateInstaller} />
      <Route path="/track-quote" component={TrackQuote} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <FAQChatbot />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
