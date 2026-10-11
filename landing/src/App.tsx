import { LangProvider } from "./i18n";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { WhatIs } from "./components/WhatIs";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { DemoChat } from "./components/DemoChat";
import { QuickStart } from "./components/QuickStart";
import { Install } from "./components/Install";
import { Faq } from "./components/Faq";
import { FinalCta, Footer } from "./components/Closing";

export default function App() {
  return (
    <LangProvider>
      <Navbar />
      <main>
        <Hero />
        <WhatIs />
        <Features />
        <HowItWorks />
        <DemoChat />
        <QuickStart />
        <Install />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </LangProvider>
  );
}
