"use client";

import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import styles from "./Carousel.module.scss";

type EmblaApi = UseEmblaCarouselType[1];

export function Carousel({
  children,
  setApi,
  className,
}: {
  children: React.ReactNode;
  setApi?: (api: EmblaApi) => void;
  className?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    duration: 22,
  });

  useEffect(() => {
    if (emblaApi && setApi) setApi(emblaApi);
  }, [emblaApi, setApi]);

  return (
    <div className={cn("Carousel", styles.carousel, className)} ref={emblaRef}>
      {children}
    </div>
  );
}

export function CarouselContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("CarouselContent", styles.carouselContent, className)}>
      {children}
    </div>
  );
}

export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("CarouselItem", styles.carouselItem, className)}>
      {children}
    </div>
  );
}
