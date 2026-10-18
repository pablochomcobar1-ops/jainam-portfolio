import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import Background from "./components/Background";
import IntroGate from "./components/IntroGate";
import SoundToggle from "./components/SoundToggle";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contact from "./components/Contact";

const MUSIC_VOLUME = 0.6; // 0 = silent, 1 = full

export default function App() {
  const [entered, setEntered] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);

  // Smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({ anchors: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Create the music player once
  useEffect(() => {
    const audio = new Audio("/audio/intro.mp3");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Fade the volume in or out whenever sound is switched
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const target = soundOn ? MUSIC_VOLUME : 0;
    let frameId;

    function fade() {
      const diff = target - audio.volume;
      if (Math.abs(diff) < 0.01) {
        audio.volume = target;
        if (!soundOn) audio.pause();
        return;
      }
      audio.volume = Math.min(1, Math.max(0, audio.volume + diff * 0.05));
      frameId = requestAnimationFrame(fade);
    }

    frameId = requestAnimationFrame(fade);
    return () => cancelAnimationFrame(frameId);
  }, [soundOn]);

  // play() must run directly inside the click, or some browsers block it
  function startMusic() {
    audioRef.current?.play().catch(() => setSoundOn(false));
  }

  function handleEnter(withSound) {
    if (withSound) startMusic();
    setSoundOn(withSound);
    setEntered(true);
  }

  function toggleSound() {
    if (!soundOn) startMusic();
    setSoundOn((s) => !s);
  }

  return (
    <>
      <Background />
      <div className="grain" aria-hidden="true" />

      <AnimatePresence>
        {!entered && <IntroGate key="gate" onEnter={handleEnter} />}
      </AnimatePresence>

      {entered && (
        <>
          <Navbar />
          <main>
            <Hero />
            <Projects />
            <About />
            <Contact />
          </main>
          <SoundToggle on={soundOn} onToggle={toggleSound} />
        </>
      )}
    </>
  );
}
