"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useTranslation } from "@/shared/i18n";
import videoThumbnail from "@/shared/assets/images/video-thumbnail.png";
import videoPoster from "@/shared/assets/images/video-poster.png";
import playCircleIcon from "@/shared/assets/icons/play-circle.svg";
import volumeXIcon from "@/shared/assets/icons/volume-x.svg";

const CURTAIN_DURATION = 0.6;
const CURTAIN_DELAY_MS = 650;
const CURTAIN_EASE = [0.4, 0, 0.2, 1] as const;

export function VideoSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useTranslation();

  const handleWatch = useCallback(() => {
    // Open curtains
    setIsExpanded(true);

    // Play video immediately — must be synchronous in click handler
    // to preserve user gesture (browser allows unmuted autoplay)
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
    }
    setIsMuted(false);
    setIsPaused(false);
    setVideoStarted(false);

    // After curtains finish, swap poster → video visually
    setTimeout(() => {
      setIsPlaying(true);
    }, CURTAIN_DELAY_MS);
  }, []);

  const handleClose = useCallback(() => {
    // Close curtains first (covers everything)
    setIsExpanded(false);

    // After curtains closed, stop video and swap back to poster
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setIsPaused(false);
      setVideoStarted(false);
    }, CURTAIN_DELAY_MS);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  return (
    <section className="bg-green-dark pt-[154px] pb-[243px] max-sm:pt-[40px] max-sm:pb-[40px] sm:pt-[60px] sm:pb-[60px] md:pt-[80px] md:pb-[120px] lg:pt-[120px] lg:pb-[180px] xl:pt-[154px] xl:pb-[243px]">
      {/* Title with masked thumbnail — always visible */}
      <div className="relative h-[135px] w-[911px] max-sm:mr-1 max-sm:ml-[0px] max-sm:h-auto max-sm:w-full max-sm:pr-4 sm:pl-8 md:pl-12 lg:pl-16 xl:pl-[100px] max-lg:w-full max-lg:pr-4 lg:w-[800px] xl:w-full">
        <h2
          className="relative z-10 text-left font-sans text-[150px] font-extrabold uppercase leading-[0.9] tracking-tight max-sm:text-[48px] sm:text-[64px] md:text-[80px] lg:text-[120px] xl:text-[150px]"
          style={{
            backgroundImage: `url(${videoThumbnail.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          {t.video.title}
        </h2>
      </div>

      {/* Banner container with curtain overlays */}
      <div className="mx-auto mt-[36px] flex w-full flex-col items-end max-xl:px-4">
        <div className="relative w-full overflow-hidden rounded-lg max-md:aspect-[3/4]">
          {/* Poster image — fills container, absolute on mobile (aspect-ratio sizes container) */}
          <Image
            src={videoPoster}
            alt="Video preview"
            width={1533}
            height={862}
            className={`object-cover object-center grayscale max-md:absolute max-md:inset-0 max-md:h-full max-md:w-full md:w-full ${isPlaying ? "invisible" : ""}`}
          />

          {/* Video layer — always in DOM (for immediate play on click), absolute overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-green-dark md:bg-black/90 ${isPlaying ? "" : "invisible"}`}>
            <video
              ref={videoRef}
              className={`h-full w-full rounded-lg object-contain md:w-auto md:max-w-[400px] lg:max-w-[480px] ${!videoStarted ? "grayscale" : ""}`}
              muted={isMuted}
              playsInline
              onPlaying={() => setVideoStarted(true)}>
              <source src="/video/course-video.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Top curtain */}
          <motion.div
            initial={false}
            animate={{ y: isExpanded ? "-100%" : "0%" }}
            transition={{ duration: CURTAIN_DURATION, ease: CURTAIN_EASE }}
            className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-[35%] bg-green-dark"
          />

          {/* Bottom curtain */}
          <motion.div
            initial={false}
            animate={{ y: isExpanded ? "100%" : "0%" }}
            transition={{ duration: CURTAIN_DURATION, ease: CURTAIN_EASE }}
            className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-[35%] bg-green-dark"
          />
        </div>

        {/* Watch button — hidden when playing */}
        {!isPlaying ?
          <button
            onClick={handleWatch}
            className="mr-10 mt-2 cursor-pointer font-sans text-[24px] font-normal uppercase tracking-tight text-yellow-accent max-sm:text-[28px] max-sm:mt-0"
            style={{ letterSpacing: "-0.07em" }}>
            {t.video.watchVideo}
          </button>
        : null}
      </div>

      {/* Controls bar — visible when playing */}
      {isPlaying && (
        <div className="mt-4 max-xl:px-4">
          <div className="flex items-center justify-between rounded-[48px] bg-yellow-accent px-[33px] py-[8px] max-sm:px-4">
            {/* Left: play/pause + volume */}
            <div className="flex items-center gap-[36px] max-sm:gap-4">
              <button
                onClick={handlePlayPause}
                className="flex cursor-pointer items-center justify-center">
                <Image
                  src={playCircleIcon}
                  alt={isPaused ? "Play" : "Pause"}
                  width={48}
                  height={48}
                  className="max-sm:h-8 max-sm:w-8"
                />
              </button>
              <button
                onClick={handleMuteToggle}
                className="flex cursor-pointer items-center justify-center">
                <Image
                  src={volumeXIcon}
                  alt={isMuted ? "Unmute" : "Mute"}
                  width={48}
                  height={48}
                  className="max-sm:h-8 max-sm:w-8"
                />
              </button>
            </div>

            {/* Right: close button */}
            <button
              onClick={handleClose}
              className="cursor-pointer font-sans text-[24px] font-normal uppercase text-green-secondary max-sm:text-[16px]"
              style={{ letterSpacing: "-0.07em" }}>
              {t.video.close}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
