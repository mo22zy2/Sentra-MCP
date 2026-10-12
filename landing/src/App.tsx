import { MotionConfig } from "motion/react";
import { LangProvider } from "./i18n";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { WhatIs } from "./components/WhatIs";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Agents } from "./components/Agents";
import { DemoChat } from "./components/DemoChat";
import { QuickStart } from "./components/QuickStart";
import { Install } from "./components/Install";
import { Faq } from "./components/Faq";
import { FinalCta, Footer } from "./components/Closing";
import { DevAgentBar } from "./components/DevAgentBar";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <LangProvider>
      <Navbar />
      <main>
        <Hero />
        <WhatIs />
        <Features />
        <HowItWorks />
        <Agents />
        <DemoChat />
        <QuickStart />
        <Install />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      {import.meta.env.DEV ? <DevAgentBar /> : null}
    </LangProvider>
    </MotionConfig>
  );
}
