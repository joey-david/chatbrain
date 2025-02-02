import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileCode, Brain, TextSelect, ImageIcon, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

function Home() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => [
      { label: "Text Logs", icon: TextSelect },
      { label: "Screenshots", icon: ImageIcon },
      { label: "Voice Messages", icon: Mic },
    ],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full flex items-center justify-center py-20 lg:py-40 flex-col gap-8">
      <div className="text-center max-w-3xl">
        <h1 className="text-3xl md:text-7xl tracking-tighter font-regular">
        <span className="text-slate-200 md:text-5xl mb-2 md:mb-5 block max-w-2xl relative mx-auto">
          Get a deep analysis of your conversations from
        </span>
        <span className="relative flex justify-center overflow-hidden pb-4 pt-1">
        &nbsp;
        {titles.map((title, index) => (
          <motion.span
          key={index}
          className="absolute font-semibold text-4xl md:text-6xl flex items-center gap-2 text-slate-200"
          initial={{ opacity: 0, y: "-100" }}
          transition={{ type: "spring", stiffness: 50 }}
          animate={
            titleNumber === index
            ? { y: 0, opacity: 1 }
            : { y: titleNumber > index ? -150 : 150, opacity: 0 }
          }
          >
          <title.icon className="h-7 w-7 md:h-10 md:w-10" />
          {title.label}
          </motion.span>
        ))}
        </span>
        </h1>
        <p className="text-slate-300 text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-5xl mx-2 md:mx-auto">
          Get a truly impartial outlook on your conversations, no matter the platform.
          <br className="hidden md:block"/>&nbsp;
          Receive a grading on a variety of conversational metrics, and see how you can improve.
          <br className="hidden md:block"/>&nbsp;
          chatbrain is fully <a href="https://github.com/joey-david/chatbrain" className="font-bold underline text-indigo-300">open-source</a> and stores none of your data beyond the session.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <a href="/use" className="inline-block">
          <Button size="lg" className="gap-3 w-full text-base h-10 md:h-11" variant="secondary">
            <Brain className="h-5 w-5 md:h-6 md:w-6" /> Start analyzing
          </Button>
        </a>
        <a
          href="https://github.com/joey-david/chatbrain"
          target="_blank"
          className="inline-block"
        >
          <Button size="lg" className="gap-3 w-full text-base h-10 md:h-11">
            <FileCode className="h-5 w-5 md:h-6 md:w-6" /> How it works
          </Button>
        </a>
      </div>
    </div>
  );
}

export { Home };
