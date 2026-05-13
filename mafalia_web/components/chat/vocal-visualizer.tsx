"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";

interface VocalVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export function VocalVisualizer({ isListening, isSpeaking }: VocalVisualizerProps) {
  if (!isListening && !isSpeaking) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md shadow-lg">
      <div className="relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center"
            >
              <Mic className="size-4 text-primary z-10" />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute size-8 rounded-full bg-primary/30"
              />
              <motion.div
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  delay: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute size-8 rounded-full bg-primary/20"
              />
            </motion.div>
          ) : (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center"
            >
              <Volume2 className="size-4 text-primary z-10" />
              <div className="flex gap-1 ml-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [4, 12, 4],
                    }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-1 bg-primary rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
        {isListening ? "Listening..." : "Speaking..."}
      </span>
    </div>
  );
}
